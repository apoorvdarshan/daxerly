import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelSubscription } from "@/lib/paypal";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reason } = await req.json().catch(() => ({}));

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!sub) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 }
    );
  }

  await cancelSubscription(sub.paypalSubscriptionId, reason || "User requested cancellation");

  await Promise.all([
    prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: "CANCELLED",
        cancelReason: reason || null,
        cancelledAt: new Date(),
      },
    }),
    prisma.cancellationLog.create({
      data: {
        userId: session.user.id,
        reason: reason || null,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
