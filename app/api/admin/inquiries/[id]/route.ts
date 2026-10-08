import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { badRequest, notFound, serverError } from "@/lib/api/response";
import type { ResultSetHeader } from "mysql2";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) return badRequest("Invalid inquiry ID.");

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM inquiries WHERE id = ?`,
      [numId]
    );

    if (result.affectedRows === 0) return notFound("Inquiry not found.");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/inquiries/[id]]", err);
    return serverError();
  }
}
