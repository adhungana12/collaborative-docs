import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

// who am i?
export async function GET() {
  const user = await getUser();
  return NextResponse.json({ user: user ?? null });
}

// log in — just pass an email, we'll set a cookie
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Need an email" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "No account with that email" },
      { status: 404 }
    );
  }

  const res = NextResponse.json({ user });
  res.cookies.set("userId", user.id, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return res;
}

// log out
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("userId");
  return res;
}
