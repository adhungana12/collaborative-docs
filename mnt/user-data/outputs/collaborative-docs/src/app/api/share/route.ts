import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

// share a doc with someone
export async function POST(req: NextRequest) {
  const me = await getUser();
  if (!me)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { documentId, email, permission = "view" } = await req.json();

  if (!documentId || !email) {
    return NextResponse.json(
      { error: "Need documentId and email" },
      { status: 400 }
    );
  }
  if (permission !== "view" && permission !== "edit") {
    return NextResponse.json(
      { error: 'Permission should be "view" or "edit"' },
      { status: 400 }
    );
  }

  // only owners can share
  const doc = await db.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.ownerId !== me.id) {
    return NextResponse.json({ error: "Not your document" }, { status: 403 });
  }

  const target = await db.user.findUnique({ where: { email } });
  if (!target) {
    return NextResponse.json(
      { error: `Nobody here with email ${email}` },
      { status: 404 }
    );
  }
  if (target.id === me.id) {
    return NextResponse.json(
      { error: "That's you — can't share with yourself" },
      { status: 400 }
    );
  }

  // upsert so re-sharing just updates the permission level
  const share = await db.documentShare.upsert({
    where: { documentId_userId: { documentId, userId: target.id } },
    update: { permission },
    create: { documentId, userId: target.id, permission },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ share }, { status: 201 });
}

// remove someone's access
export async function DELETE(req: NextRequest) {
  const me = await getUser();
  if (!me)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { documentId, userId } = await req.json();

  const doc = await db.document.findUnique({ where: { id: documentId } });
  if (!doc || doc.ownerId !== me.id) {
    return NextResponse.json({ error: "Not your document" }, { status: 403 });
  }

  await db.documentShare.deleteMany({ where: { documentId, userId } });
  return NextResponse.json({ ok: true });
}
