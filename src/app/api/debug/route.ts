import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pullGitHubActivity } from "@/lib/integrations/github";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const conn = await prisma.connection.findFirst({
    where: { userId: session.user.id, provider: "github" },
  });

  if (!conn) {
    return NextResponse.json({ error: "No GitHub connection found" });
  }

  try {
    const activity = await pullGitHubActivity(conn.accessToken);
    return NextResponse.json({ success: true, activity });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ success: false, error: message, stack });
  }
}
