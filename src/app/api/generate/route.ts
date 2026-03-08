import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pullGitHubActivity, formatGitHubActivity } from "@/lib/integrations/github";
import { pullSlackActivity, formatSlackActivity } from "@/lib/integrations/slack";
import {
  pullCalendarActivity,
  formatCalendarActivity,
} from "@/lib/integrations/google-calendar";
import { pullLinearActivity, formatLinearActivity } from "@/lib/integrations/linear";
import { pullNotionActivity, formatNotionActivity } from "@/lib/integrations/notion";
import { pullGitLabActivity, formatGitLabActivity } from "@/lib/integrations/gitlab";
import { summarizeActivities } from "@/lib/summarizer";
import { hasActiveSubscription } from "@/lib/subscription";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasActiveSubscription(session.user.id))) {
    return NextResponse.json(
      { error: "subscription_required" },
      { status: 403 }
    );
  }

  const connections = await prisma.connection.findMany({
    where: { userId: session.user.id },
  });

  const allActivities: Array<{
    type: string;
    label: string;
    quantity: string;
    raw: number;
  }> = [];

  // Pull from each connected service in parallel
  const pullPromises = connections.map(async (conn) => {
    try {
      switch (conn.provider) {
        case "github": {
          const activity = await pullGitHubActivity(conn.accessToken);
          return formatGitHubActivity(activity);
        }
        case "slack": {
          const activity = await pullSlackActivity(conn.accessToken);
          return formatSlackActivity(activity);
        }
        case "google": {
          const activity = await pullCalendarActivity(conn.accessToken);
          return formatCalendarActivity(activity);
        }
        case "linear": {
          const activity = await pullLinearActivity(conn.accessToken);
          return formatLinearActivity(activity);
        }
        case "notion": {
          const activity = await pullNotionActivity(conn.accessToken);
          return formatNotionActivity(activity);
        }
        case "gitlab": {
          const activity = await pullGitLabActivity(conn.accessToken);
          return formatGitLabActivity(activity);
        }
        default:
          return [];
      }
    } catch (error) {
      console.error(`Failed to pull ${conn.provider} activity:`, error);
      return [];
    }
  });

  const results = await Promise.all(pullPromises);
  for (const items of results) {
    allActivities.push(...items);
  }

  // If no activities found, return a friendly message
  if (allActivities.length === 0) {
    return NextResponse.json(
      {
        error:
          "No activity found in the last 24 hours. Make sure your tools are connected and you have recent activity.",
      },
      { status: 404 }
    );
  }

  // Calculate line items
  const lineItems = summarizeActivities(allActivities);
  const subtotal = lineItems.reduce((sum, item) => sum + item.value, 0);
  const tax = subtotal * 0.0869;
  const totalValue = Math.round((subtotal + tax) * 100) / 100;

  // Save receipt
  const receipt = await prisma.receipt.create({
    data: {
      userId: session.user.id,
      date: new Date(),
      lineItems: JSON.parse(JSON.stringify(lineItems)),
      totalValue,
    },
  });

  return NextResponse.json({
    id: receipt.id,
    date: receipt.date.toISOString(),
    lineItems,
    totalValue,
    userName: session.user.name,
  });
}
