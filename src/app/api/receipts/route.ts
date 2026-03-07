import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipts = await prisma.receipt.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 7,
  });

  return NextResponse.json(
    receipts.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      lineItems: r.lineItems as Array<{
        label: string;
        quantity: string;
        value: number;
      }>,
      totalValue: r.totalValue,
      userName: session.user.name,
    }))
  );
}
