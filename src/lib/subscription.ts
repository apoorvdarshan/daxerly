import { prisma } from "@/lib/prisma";

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  // Admin gets free access
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (user?.email && user.email === process.env.ADMIN_EMAIL) return true;

  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub) return false;

  return sub.status === "ACTIVE";
}
