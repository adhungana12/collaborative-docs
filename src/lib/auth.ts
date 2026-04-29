import { cookies } from "next/headers";
import { db } from "./db";

/**
 * Grab the currently logged-in user from the cookie.
 * Returns null if nobody's logged in — callers decide what to do.
 */
export async function getUser() {
  const jar = cookies();
  const id = jar.get("userId")?.value;
  if (!id) return null;

  return db.user.findUnique({ where: { id } });
}
