import { NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { serverError } from "@/lib/api/response";
import type { RowDataPacket } from "mysql2";

function parseJSON(val: unknown): any {
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

// GET /api/admin/applications
// Returns all applications joined with job details and calculated suitability score
export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         a.id, a.job_id, a.full_name, a.email, a.phone,
         a.date_of_birth, a.qualification,
         a.is_jp_bilingual, a.jp_level, a.resume_path,
         a.status, a.created_at, a.updated_at,
         j.title AS job_title, j.required_skills, j.experience, j.languages
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       ORDER BY a.created_at DESC`
    );

    const applications = rows.map((app: any) => {
      // Return application without exposing raw server file path
      const { resume_path, ...appData } = app;
      return appData;
    });

    return NextResponse.json({ applications });
  } catch (err) {
    console.error("[GET /api/admin/applications]", err);
    return serverError();
  }
}
