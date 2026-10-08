import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME  = "application/pdf";

// Resolve the upload base directory from env.
// Falls back to ./storage for local dev.
function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR || "./storage";
  // Resolve relative paths from project root (process.cwd())
  return path.isAbsolute(dir) ? dir : path.resolve(/*turbopackIgnore: true*/ process.cwd(), dir);
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface ResumeValidationError {
  field: string;
  message: string;
}

export function validateResumeFile(
  mimeType: string,
  sizeBytes: number
): ResumeValidationError | null {
  if (mimeType !== ALLOWED_MIME) {
    return { field: "resume", message: "Only PDF files are accepted." };
  }
  if (sizeBytes > MAX_FILE_SIZE) {
    return { field: "resume", message: "Resume must be 5 MB or smaller." };
  }
  return null;
}

// ── Save ──────────────────────────────────────────────────────────────────────

export interface SavedResume {
  resumePath: string;  // relative path stored in DB: resumes/YYYY/MM/<uuid>.pdf
  fullPath: string;    // absolute path on disk (never exposed to client)
}

export async function saveResume(buffer: Buffer): Promise<SavedResume> {
  const now     = new Date();
  const year    = now.getUTCFullYear().toString();
  const month   = String(now.getUTCMonth() + 1).padStart(2, "0");
  const uuid    = uuidv4();
  const filename = `${uuid}.pdf`;

  // Relative path stored in MySQL
  const resumePath = `resumes/${year}/${month}/${filename}`;

  // Absolute path on disk
  const fullPath = path.join(getUploadDir(), resumePath);
  const dirPath  = path.dirname(fullPath);

  // Create directory structure if it doesn't exist
  fs.mkdirSync(dirPath, { recursive: true });

  // Write file
  fs.writeFileSync(fullPath, buffer);

  return { resumePath, fullPath };
}

// ── Delete (rollback on DB failure) ──────────────────────────────────────────

export function deleteResume(resumePath: string): void {
  try {
    const fullPath = path.join(getUploadDir(), resumePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    // Log but do not throw — this is a cleanup step, not a critical failure
    console.error("[storage/resume] Failed to delete resume during rollback:", err);
  }
}

// ── Resolve for serving ───────────────────────────────────────────────────────

export function resolveResumePath(resumePath: string): string {
  return path.join(getUploadDir(), resumePath);
}
