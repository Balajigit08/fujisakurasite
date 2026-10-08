import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { badRequest, created, serverError } from "@/lib/api/response";
import type { RowDataPacket } from "mysql2";

// GET /api/admin/jobs
// Returns all jobs (active + inactive) for the admin dashboard
export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         id, title, employment_type, experience, notice_period,
         languages, description, responsibilities, required_skills,
         image_url, is_featured, is_active, created_at, updated_at
       FROM jobs
       ORDER BY created_at DESC`
    );

    const jobs = rows.map(parseJobRow);
    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("[GET /api/admin/jobs]", err);
    return serverError();
  }
}

// POST /api/admin/jobs
// Creates a new job posting
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await req.json();

    const {
      title, employment_type, experience, notice_period,
      languages, description, responsibilities, required_skills = [], requiredSkills,
      image_url = null, is_featured = 1,
    } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!title?.trim())            missing.push("title");
    if (!employment_type?.trim())  missing.push("employment_type");
    if (!experience?.trim())       missing.push("experience");
    if (!notice_period?.trim())    missing.push("notice_period");
    if (!Array.isArray(languages) || languages.length === 0) missing.push("languages");
    if (!description?.trim())      missing.push("description");
    if (!Array.isArray(responsibilities) || responsibilities.filter((r: string) => r.trim()).length === 0)
      missing.push("responsibilities");

    if (missing.length > 0) {
      return badRequest(`Missing required fields: ${missing.join(", ")}.`);
    }

    const cleanResponsibilities = responsibilities.filter((r: string) => r.trim());
    const rawSkills = Array.isArray(required_skills) && required_skills.length > 0 ? required_skills : (Array.isArray(requiredSkills) ? requiredSkills : []);
    const cleanSkills = rawSkills.filter((s: string) => typeof s === "string" && s.trim().length > 0);

    const [result] = await pool.execute<any>(
      `INSERT INTO jobs
         (title, employment_type, experience, notice_period,
          languages, description, responsibilities, required_skills, image_url, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        employment_type.trim(),
        experience.trim(),
        notice_period.trim(),
        JSON.stringify(languages),
        description.trim(),
        JSON.stringify(cleanResponsibilities),
        JSON.stringify(cleanSkills),
        image_url,
        is_featured ? 1 : 0,
      ]
    );

    const insertId = result.insertId;

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM jobs WHERE id = ? LIMIT 1",
      [insertId]
    );

    return created({ job: parseJobRow(rows[0]) });
  } catch (err) {
    console.error("[POST /api/admin/jobs]", err);
    return serverError();
  }
}

function parseJobRow(job: RowDataPacket) {
  return {
    ...job,
    languages:        parseJSON(job.languages),
    responsibilities: parseJSON(job.responsibilities),
    required_skills:  parseJSON(job.required_skills),
  };
}

function parseJSON(value: unknown): unknown {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}
