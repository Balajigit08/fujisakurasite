import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./storage";

// GET /api/images/job-images/<uuid>.jpg
// Serves stored job images publicly.
// Only serves files from the job-images/ subdirectory — never resumes.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ imagePath: string[] }> }
) {
  try {
    const { imagePath } = await params;

    // Only allow serving from job-images/ — block any attempt to access resumes/
    if (!imagePath || imagePath[0] !== "job-images") {
      return new NextResponse("Not found.", { status: 404 });
    }

    // Prevent path traversal — no ".." segments allowed
    const joined = imagePath.join("/");
    if (joined.includes("..")) {
      return new NextResponse("Not found.", { status: 404 });
    }

    const baseDir  = path.isAbsolute(UPLOAD_DIR)
      ? UPLOAD_DIR
      : path.resolve(/*turbopackIgnore: true*/ process.cwd(), UPLOAD_DIR);

    const fullPath = path.join(baseDir, joined);

    // Ensure the resolved path is still inside UPLOAD_DIR/job-images
    const allowedDir = path.join(baseDir, "job-images");
    if (!fullPath.startsWith(allowedDir)) {
      return new NextResponse("Not found.", { status: 404 });
    }

    if (!fs.existsSync(fullPath)) {
      return new NextResponse("Not found.", { status: 404 });
    }

    const buffer = fs.readFileSync(fullPath);
    const ext    = path.extname(fullPath).toLowerCase();
    const mime   = extToMime(ext);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":  mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[GET /api/images]", err);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}

function extToMime(ext: string): string {
  const map: Record<string, string> = {
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png":  "image/png",
    ".webp": "image/webp",
    ".gif":  "image/gif",
    ".svg":  "image/svg+xml",
  };
  return map[ext] ?? "application/octet-stream";
}
