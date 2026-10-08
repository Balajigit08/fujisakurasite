import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE   = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR || "./storage";
  return path.isAbsolute(dir) ? dir : path.resolve(/*turbopackIgnore: true*/ process.cwd(), dir);
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateImageFile(
  mimeType: string,
  sizeBytes: number
): string | null {
  if (!ALLOWED_MIME.includes(mimeType)) {
    return "Only JPG, PNG, WEBP, GIF, or SVG images are accepted.";
  }
  if (sizeBytes > MAX_SIZE) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

// ── Save ──────────────────────────────────────────────────────────────────────

export interface SavedJobImage {
  imagePath: string; // relative path stored in DB: job-images/<uuid>.<ext>
  fullPath:  string; // absolute path on disk (never exposed to client)
}

export async function saveJobImage(
  buffer: Buffer,
  mimeType: string
): Promise<SavedJobImage> {
  const ext      = mimeToExt(mimeType);
  const filename = `${uuidv4()}${ext}`;
  const imagePath = `job-images/${filename}`;
  const fullPath  = path.join(getUploadDir(), imagePath);
  const dirPath   = path.dirname(fullPath);

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(fullPath, buffer);

  return { imagePath, fullPath };
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function deleteJobImage(imagePath: string): void {
  try {
    const fullPath = path.join(getUploadDir(), imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error("[storage/job-image] Failed to delete image:", err);
  }
}

// ── Resolve for serving ───────────────────────────────────────────────────────

export function resolveJobImagePath(imagePath: string): string {
  return path.join(getUploadDir(), imagePath);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg":    ".jpg",
    "image/png":     ".png",
    "image/webp":    ".webp",
    "image/gif":     ".gif",
    "image/svg+xml": ".svg",
  };
  return map[mime] ?? ".jpg";
}
