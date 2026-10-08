import { getSession } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/response";

/**
 * Verifies the request carries a valid admin session.
 * Returns null if authenticated, or a 401 NextResponse if not.
 * Usage:
 *   const guard = await requireAdmin();
 *   if (guard) return guard;
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return unauthorized();
  }
  return null;
}
