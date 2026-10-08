import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { badRequest, notFound, serverError } from "@/lib/api/response";
import type { ResultSetHeader } from "mysql2";

const VALID_STATUSES = ["new", "in_progress", "resolved", "archived"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) return badRequest("Invalid inquiry ID.");

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return badRequest("Invalid status.");
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE inquiries SET status = ? WHERE id = ?`,
      [status, numId]
    );

    if (result.affectedRows === 0) return notFound("Inquiry not found.");

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("[PATCH /api/admin/inquiries/[id]/status]", err);
    return serverError();
  }
}
