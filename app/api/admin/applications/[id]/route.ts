import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { notFound, serverError } from "@/lib/api/response";
import { deleteResume } from "@/lib/storage/resume";
import type { RowDataPacket } from "mysql2";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/applications/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const appId = parseInt(id, 10);
    if (isNaN(appId)) return notFound("Invalid application ID.");

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         a.id, a.job_id, a.full_name, a.email, a.phone,
         a.date_of_birth, a.qualification,
         a.is_jp_bilingual, a.jp_level,
         a.status, a.created_at, a.updated_at,
         j.title AS job_title
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?
       LIMIT 1`,
      [appId]
    );

    if (rows.length === 0) return notFound("Application not found.");
    return NextResponse.json({ application: rows[0] });
  } catch (err) {
    console.error("[GET /api/admin/applications/[id]]", err);
    return serverError();
  }
}

// DELETE /api/admin/applications/[id]
// Deletes the application record and its associated resume file from storage.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const appId = parseInt(id, 10);
    if (isNaN(appId)) return notFound("Invalid application ID.");

    // Fetch resume_path before deleting so we can clean up the file
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT resume_path FROM applications WHERE id = ? LIMIT 1",
      [appId]
    );

    if (rows.length === 0) return notFound("Application not found.");

    const resumePath = rows[0].resume_path as string;

    // Delete DB record first
    await pool.execute("DELETE FROM applications WHERE id = ?", [appId]);

    // Then delete the resume file — non-critical, log but don't fail
    if (resumePath) {
      deleteResume(resumePath);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/applications/[id]]", err);
    return serverError();
  }
}
