import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await prisma.connection.findMany({
    where: { userId: session.user.id },
    select: { provider: true },
  });

  const providers = connections.map((c) => c.provider);

  return NextResponse.json({
    github: providers.includes("github"),
    slack: providers.includes("slack"),
    google: providers.includes("google"),
  });
}
