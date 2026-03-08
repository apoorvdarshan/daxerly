import { prisma } from "@/lib/prisma";

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub) return false;

  if (sub.status === "ACTIVE") return true;

  if (
    sub.status === "CANCELLED" &&
    sub.currentPeriodEnd &&
    sub.currentPeriodEnd > new Date()
  ) {
    return true;
  }

  return false;
}
