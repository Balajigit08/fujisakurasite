import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-guard";
import { validateImageFile, saveJobImage } from "@/lib/storage/job-image";
import { badRequest, serverError } from "@/lib/api/response";

// POST /api/admin/jobs/image
// Uploads a job position image and returns the relative path.
// Called by the admin form before/during job save.
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return badRequest("Invalid form data.");
    }

    const imageFile = formData.get("image") as File | null;
    if (!imageFile) return badRequest("No image file provided.");

    const buffer   = Buffer.from(await imageFile.arrayBuffer());
    const mimeType = imageFile.type;
    const fileSize = buffer.length;

    const error = validateImageFile(mimeType, fileSize);
    if (error) return badRequest(error);

    const { imagePath } = await saveJobImage(buffer, mimeType);

    // Return the relative path — this is what gets stored in MySQL image_url
    return NextResponse.json({ image_url: imagePath }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/jobs/image]", err);
    return serverError();
  }
}
