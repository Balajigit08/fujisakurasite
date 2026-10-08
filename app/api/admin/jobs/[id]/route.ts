import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { badRequest, notFound, serverError } from "@/lib/api/response";
import type { RowDataPacket } from "mysql2";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/jobs/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const job = await getJob(parseInt(id, 10));
    if (!job) return notFound("Job not found.");
    return NextResponse.json({ job });
  } catch (err) {
    console.error("[GET /api/admin/jobs/[id]]", err);
    return serverError();
  }
}

// PUT /api/admin/jobs/[id]
// Replaces all editable fields on the job
export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) return notFound("Invalid job ID.");

    const existing = await getJob(jobId);
    if (!existing) return notFound("Job not found.");

    const body = await req.json();
    const {
      title, employment_type, experience, notice_period,
      languages, description, responsibilities, required_skills = [], requiredSkills,
      image_url, is_featured,
    } = body;

    const missing: string[] = [];
    if (!title?.trim())           missing.push("title");
    if (!employment_type?.trim()) missing.push("employment_type");
    if (!experience?.trim())      missing.push("experience");
    if (!notice_period?.trim())   missing.push("notice_period");
    if (!Array.isArray(languages) || languages.length === 0) missing.push("languages");
    if (!description?.trim())     missing.push("description");
    if (!Array.isArray(responsibilities) || responsibilities.filter((r: string) => r.trim()).length === 0)
      missing.push("responsibilities");

    if (missing.length > 0) {
      return badRequest(`Missing required fields: ${missing.join(", ")}.`);
    }

    const cleanResponsibilities = responsibilities.filter((r: string) => r.trim());
    const rawSkills = Array.isArray(required_skills) && required_skills.length > 0 ? required_skills : (Array.isArray(requiredSkills) ? requiredSkills : []);
    const cleanSkills = rawSkills.filter((s: string) => typeof s === "string" && s.trim().length > 0);

    await pool.execute(
      `UPDATE jobs SET
         title = ?, employment_type = ?, experience = ?,
         notice_period = ?, languages = ?, description = ?,
         responsibilities = ?, required_skills = ?, image_url = ?, is_featured = ?
       WHERE id = ?`,
      [
        title.trim(),
        employment_type.trim(),
        experience.trim(),
        notice_period.trim(),
        JSON.stringify(languages),
        description.trim(),
        JSON.stringify(cleanResponsibilities),
        JSON.stringify(cleanSkills),
        image_url ?? null,
        is_featured ? 1 : 0,
        jobId,
      ]
    );

    const updated = await getJob(jobId);
    return NextResponse.json({ job: updated });
  } catch (err) {
    console.error("[PUT /api/admin/jobs/[id]]", err);
    return serverError();
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

// DELETE /api/admin/jobs/[id]
// Hard deletes a job only if it has no applications (FK RESTRICT protects this)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) return notFound("Invalid job ID.");

    const existing = await getJob(jobId);
    if (!existing) return notFound("Job not found.");

    await pool.execute("DELETE FROM jobs WHERE id = ?", [jobId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    // MySQL FK constraint violation — job has applications, cannot delete
    if (err?.code === "ER_ROW_IS_REFERENCED_2") {
      return badRequest(
        "This job has existing applications and cannot be deleted. Deactivate it instead."
      );
    }
    console.error("[DELETE /api/admin/jobs/[id]]", err);
    return serverError();
  }
}

async function getJob(jobId: number) {
  if (isNaN(jobId)) return null;
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM jobs WHERE id = ? LIMIT 1",
    [jobId]
  );
  if (rows.length === 0) return null;
  return parseJobRow(rows[0]);
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
