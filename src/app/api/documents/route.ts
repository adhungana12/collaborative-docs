import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

const unauthorized = () =>
  NextResponse.json({ error: 'Not logged in' }, { status: 401 });

export async function GET() {
  const me = await getUser();
  if (!me) return unauthorized();

  const owned = await db.document.findMany({
    where: { ownerId: me.id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const shared = await db.document.findMany({
    where: { shares: { some: { userId: me.id } } },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        where: { userId: me.id },
        select: { permission: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({
    owned: owned.map((d) => ({ ...d, role: 'owner' })),
    shared: shared.map((d) => ({
      ...d,
      role: 'shared',
      myPermission: d.shares[0]?.permission ?? 'view',
    })),
  });
}

export async function POST(req: NextRequest) {
  const me = await getUser();
  if (!me) return unauthorized();

  const body = await req.json().catch(() => ({}));

  const doc = await db.document.create({
    data: {
      title: body.title || 'Untitled',
      content: body.content || '',
      ownerId: me.id,
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ document: doc }, { status: 201 });
}
