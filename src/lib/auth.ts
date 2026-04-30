import { cookies } from 'next/headers';
import { db } from './db';

export async function getUser() {
  const jar = cookies();
  const id = jar.get('userId')?.value;
  if (!id) return null;

  return db.user.findUnique({ where: { id } });
}
