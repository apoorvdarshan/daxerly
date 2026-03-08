import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ admin: false }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = !!adminEmail && session.user.email === adminEmail;

  return NextResponse.json({ admin: isAdmin });
}
