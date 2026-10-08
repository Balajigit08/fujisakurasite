import { NextRequest } from "next/server";
import pool from "@/lib/db/connection";
import {
  validateResumeFile,
  saveResume,
  deleteResume,
} from "@/lib/storage/resume";
import {
  badRequest,
  notFound,
  unprocessable,
  created,
  serverError,
} from "@/lib/api/response";
import { sendMail } from "@/lib/email/mailer";
import { jobApplicationTemplate } from "@/lib/email/templates";
import { isValidEmail } from "@/lib/validation/email";
import type { RowDataPacket } from "mysql2";

// POST /api/careers/apply
// Public endpoint — submits a job application with resume upload
export async function POST(req: NextRequest) {
  let savedResumePath: string | null = null;

  try {
    // ── 1. Parse multipart form data ──────────────────────────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return badRequest("Invalid form data.");
    }

    const jobIdRaw      = formData.get("job_id")?.toString().trim();
    const fullName      = formData.get("full_name")?.toString().trim();
    const email         = formData.get("email")?.toString().trim();
    const phone         = formData.get("phone")?.toString().trim();
    const dateOfBirth   = formData.get("date_of_birth")?.toString().trim();
    const qualification = formData.get("qualification")?.toString().trim();
    const isBilingualRaw = formData.get("is_jp_bilingual")?.toString().trim();
    const jpLevel       = formData.get("jp_level")?.toString().trim() || null;
    const captchaToken  = formData.get("captcha_token")?.toString().trim();
    const resumeFile    = formData.get("resume") as File | null;

    // ── 2. Required field validation ──────────────────────────────────────
    const missing: string[] = [];
    if (!jobIdRaw)      missing.push("job_id");
    if (!fullName)      missing.push("full_name");
    if (!email)         missing.push("email");
    if (!phone)         missing.push("phone");
    if (!dateOfBirth)   missing.push("date_of_birth");
    if (!qualification) missing.push("qualification");
    if (!resumeFile)    missing.push("resume");

    if (missing.length > 0) {
      return badRequest(`Missing required fields: ${missing.join(", ")}.`);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (dateOfBirth! > todayStr) {
      return badRequest("Date of birth cannot be in the future.");
    }

    const jobId = parseInt(jobIdRaw!, 10);

    // ── 2b. reCAPTCHA verification ────────────────────────────────────────
    if (!captchaToken) {
      return badRequest("Please complete the reCAPTCHA verification.");
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const verifyRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`,
        { method: "POST" }
      );
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return badRequest("reCAPTCHA verification failed. Please try again.");
      }
    }
    if (isNaN(jobId)) {
      return badRequest("Invalid job ID.");
    }

    // ── 3. Email format validation ────────────────────────────────────────
    if (!isValidEmail(email!)) {
      return badRequest("Invalid email address.");
    }

    // ── 4. JP bilingual validation ────────────────────────────────────────
    const isJpBilingual = isBilingualRaw === "1" || isBilingualRaw === "true";
    const validLevels   = ["N1", "N2", "N3", "N4", "N5"];

    if (isJpBilingual) {
      if (!jpLevel || !validLevels.includes(jpLevel)) {
        return badRequest("JP level is required and must be one of N1–N5 when bilingual is selected.");
      }
    }

    // jp_level must be NULL when not bilingual
    const resolvedJpLevel = isJpBilingual ? jpLevel : null;

    // ── 5. File validation & Resume Detection ──────────────────────────────
    const fileBuffer = Buffer.from(await resumeFile!.arrayBuffer());
    const mimeType   = resumeFile!.type;
    const fileSize   = fileBuffer.length;

    const fileError = validateResumeFile(mimeType, fileSize);
    if (fileError) {
      return badRequest(fileError.message);
    }



    // ── 6. Verify job exists and is active ────────────────────────────────
    const [jobRows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, title, description, responsibilities, required_skills, experience, languages, is_active FROM jobs WHERE id = ? LIMIT 1",
      [jobId]
    );

    if (jobRows.length === 0) {
      return notFound("Job not found.");
    }

    if (!jobRows[0].is_active) {
      return unprocessable("This job is no longer accepting applications.");
    }



    // ── 7. Save resume to server storage ──────────────────────────────────
    const { resumePath } = await saveResume(fileBuffer);
    savedResumePath = resumePath;

    // ── 8. Insert application into MySQL ──────────────────────────────────
    try {
      const conn = await pool.getConnection();
      try {
        const sql = "INSERT INTO applications SET ?";
        await conn.query(sql, {
          job_id:          jobId,
          full_name:       fullName,
          email:           email,
          phone:           phone,
          date_of_birth:   dateOfBirth,
          qualification:   qualification,
          is_jp_bilingual: isJpBilingual ? 1 : 0,
          jp_level:        resolvedJpLevel,
          resume_path:     resumePath,
        });
      } finally {
        conn.release();
      }
    } catch (dbErr) {
      // DB insert failed — delete the saved file to prevent orphan
      deleteResume(savedResumePath);
      console.error("[apply] DB insert failed, resume deleted:", dbErr);
      return serverError("Failed to save your application. Please try again.");
    }

    // ── 9. Send email notification to HR (non-blocking) ─────────────────
    const mailTo = process.env.MAIL_TO;
    if (mailTo) {
      const { subject, html } = jobApplicationTemplate({
        fullName:      fullName!,
        email:         email!,
        phone:         phone!,
        jobTitle:      jobRows[0].title as string,
        qualification: qualification!,
        dateOfBirth:   dateOfBirth!,
        isJpBilingual: isJpBilingual,
        jpLevel:       resolvedJpLevel,
      });
      // Fire and forget — don't fail the response if email fails
      sendMail({ to: mailTo, subject, html }).catch((err) =>
        console.error("[apply] Email notification failed:", err)
      );
    }

    return created({
      success: true,
      message: "Application submitted successfully.",
    });
  } catch (err) {
    // Unexpected error — clean up resume if it was saved
    if (savedResumePath) {
      deleteResume(savedResumePath);
    }
    console.error("[POST /api/careers/apply]", err);
    return serverError();
  }
}

function parseJSON(value: unknown): any {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}
