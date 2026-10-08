import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { notFound, serverError } from "@/lib/api/response";
import type { RowDataPacket } from "mysql2";

// GET /api/careers/jobs/[id]
// Public endpoint — returns a single active job for the customer detail page
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id, 10);

    if (isNaN(jobId)) {
      return notFound("Invalid job ID.");
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         id, title, employment_type, experience, notice_period,
         languages, description, responsibilities, required_skills,
         image_url, is_featured, created_at
       FROM jobs
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [jobId]
    );

    if (rows.length === 0) {
      return notFound("Job not found.");
    }

    const job = rows[0];
    return NextResponse.json({
      job: {
        ...job,
        languages:        parseJSON(job.languages),
        responsibilities: parseJSON(job.responsibilities),
        required_skills:  parseJSON(job.required_skills),
      },
    });
  } catch (err) {
    console.error("[GET /api/careers/jobs/[id]]", err);
    return serverError();
  }
}

function parseJSON(value: unknown): unknown {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}
