import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { notFound, serverError } from "@/lib/api/response";
import { resolveResumePath } from "@/lib/storage/resume";
import type { RowDataPacket } from "mysql2";

// GET /api/admin/resumes/[id]
// Streams the resume PDF for the given application ID to the admin browser.
// Session verification is mandatory — resumes are never publicly accessible.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const appId = parseInt(id, 10);
    if (isNaN(appId)) return notFound("Invalid application ID.");

    // Fetch only the resume_path — never expose it to client directly
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT resume_path, full_name FROM applications WHERE id = ? LIMIT 1",
      [appId]
    );

    if (rows.length === 0) return notFound("Application not found.");

    const { resume_path, full_name } = rows[0];
    const absolutePath = resolveResumePath(resume_path);

    if (!fs.existsSync(absolutePath)) {
      console.error("[resumes] File not found on disk:", absolutePath);
      return notFound("Resume file not found.");
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const safeName   = (full_name as string)
      .replace(/[^a-zA-Z0-9_\- ]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 50);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}_resume.pdf"`,
        "Content-Length":      fileBuffer.length.toString(),
        // Prevent caching of sensitive files
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/resumes/[id]]", err);
    return serverError();
  }
}
