import { NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { serverError } from "@/lib/api/response";
import type { RowDataPacket } from "mysql2";

// GET /api/careers/jobs
// Public endpoint — returns only active jobs for the customer careers page
export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         id, title, employment_type, experience, notice_period,
         languages, description, responsibilities, required_skills,
         image_url, is_featured, created_at
       FROM jobs
       WHERE is_active = 1
       ORDER BY is_featured DESC, created_at DESC`
    );

    // Parse JSON fields returned as strings from MySQL
    const jobs = rows.map((job) => ({
      ...job,
      languages:        parseJSON(job.languages),
      responsibilities: parseJSON(job.responsibilities),
      required_skills:  parseJSON(job.required_skills),
    }));

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/careers/jobs]", err);
    return serverError();
  }
}

function parseJSON(value: unknown): unknown {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}
