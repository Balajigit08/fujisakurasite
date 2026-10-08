import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { badRequest, notFound, serverError } from "@/lib/api/response";
import type { RowDataPacket } from "mysql2";

// PATCH /api/admin/jobs/[id]/status
// Toggles or sets is_active on a job
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) return notFound("Invalid job ID.");

    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id, is_active FROM jobs WHERE id = ? LIMIT 1",
      [jobId]
    );
    if (existing.length === 0) return notFound("Job not found.");

    const body = await req.json();

    // Accept explicit is_active value or toggle current
    const newStatus =
      typeof body.is_active === "boolean"
        ? body.is_active ? 1 : 0
        : existing[0].is_active ? 0 : 1;

    await pool.execute(
      "UPDATE jobs SET is_active = ? WHERE id = ?",
      [newStatus, jobId]
    );

    return NextResponse.json({ id: jobId, is_active: newStatus === 1 });
  } catch (err) {
    console.error("[PATCH /api/admin/jobs/[id]/status]", err);
    return serverError();
  }
}
