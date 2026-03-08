import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscription";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await hasActiveSubscription(session.user.id);
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    active,
    status: sub?.status || null,
    currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() || null,
  });
}
