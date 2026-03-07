import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipt = await prisma.receipt.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!receipt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: receipt.id,
    date: receipt.date.toISOString(),
    lineItems: receipt.lineItems as Array<{
      label: string;
      quantity: string;
      value: number;
    }>,
    totalValue: receipt.totalValue,
    userName: session.user.name,
  });
}
