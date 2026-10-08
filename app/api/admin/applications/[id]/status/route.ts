import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { badRequest, notFound, serverError } from "@/lib/api/response";
import type { RowDataPacket } from "mysql2";

const VALID_STATUSES = ["new", "reviewed", "shortlisted", "rejected"] as const;
type ApplicationStatus = typeof VALID_STATUSES[number];

// PATCH /api/admin/applications/[id]/status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const appId = parseInt(id, 10);
    if (isNaN(appId)) return notFound("Invalid application ID.");

    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM applications WHERE id = ? LIMIT 1",
      [appId]
    );
    if (existing.length === 0) return notFound("Application not found.");

    const body = await req.json();
    const status: ApplicationStatus = body.status;

    if (!VALID_STATUSES.includes(status)) {
      return badRequest(`Status must be one of: ${VALID_STATUSES.join(", ")}.`);
    }

    await pool.execute(
      "UPDATE applications SET status = ? WHERE id = ?",
      [status, appId]
    );

    return NextResponse.json({ id: appId, status });
  } catch (err) {
    console.error("[PATCH /api/admin/applications/[id]/status]", err);
    return serverError();
  }
}
