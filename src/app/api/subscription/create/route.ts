import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscription } from "@/lib/paypal";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planId = process.env.PAYPAL_PLAN_ID;
  if (!planId) {
    return NextResponse.json(
      { error: "PayPal not configured" },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const returnUrl = `${baseUrl}/api/subscription/return`;
  const cancelUrl = `${baseUrl}/dashboard`;

  const { subscriptionId, approvalUrl } = await createSubscription(
    planId,
    returnUrl,
    cancelUrl
  );

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      paypalSubscriptionId: subscriptionId,
      status: "APPROVAL_PENDING",
    },
    update: {
      paypalSubscriptionId: subscriptionId,
      status: "APPROVAL_PENDING",
    },
  });

  return NextResponse.json({ approvalUrl });
}
