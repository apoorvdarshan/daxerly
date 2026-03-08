import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cancellations = await prisma.subscription.findMany({
    where: { status: "CANCELLED" },
    orderBy: { cancelledAt: "desc" },
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
  });

  const result = cancellations.map((sub) => ({
    email: sub.user.email,
    name: sub.user.name,
    cancelReason: sub.cancelReason,
    cancelledAt: sub.cancelledAt,
    createdAt: sub.createdAt,
  }));

  return NextResponse.json(result);
}
