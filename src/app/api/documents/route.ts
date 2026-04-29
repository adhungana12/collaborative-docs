import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const userId = cookies().get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const text = await file.text(); // works for txt/md

  const doc = await db.document.create({
    data: {
      title: file.name.replace(/\.[^/.]+$/, ''),
      content: text,
      ownerId: userId,
    },
  });

  return NextResponse.json({ document: doc });
}