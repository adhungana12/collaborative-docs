import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

type Ctx = { params: { id: string } };

async function resolveAccess(docId: string, userId: string) {
  const doc = await db.document.findUnique({
    where: { id: docId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!doc) return { doc: null, access: null };
  if (doc.ownerId === userId) return { doc, access: 'owner' as const };

  const share = doc.shares.find((s) => s.userId === userId);
  return share
    ? { doc, access: share.permission as 'view' | 'edit' }
    : { doc: null, access: null };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const me = await getUser();
  if (!me) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const { doc, access } = await resolveAccess(params.id, me.id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ document: doc, permission: access });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const me = await getUser();
  if (!me) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const { access } = await resolveAccess(params.id, me.id);
  if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (access === 'view') {
    return NextResponse.json({ error: "You don't have edit access" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, string> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;

  const doc = await db.document.update({
    where: { id: params.id },
    data: updates,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  return NextResponse.json({ document: doc });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const me = await getUser();
  if (!me) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const { access } = await resolveAccess(params.id, me.id);
  if (access !== 'owner') {
    return NextResponse.json({ error: 'Only the owner can delete' }, { status: 403 });
  }

  await db.document.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
