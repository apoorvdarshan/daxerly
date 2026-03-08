import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const receipt = await prisma.receipt.findFirst({
    where: { id },
    include: { user: { select: { name: true } } },
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
    userName: receipt.user.name,
  });
}
