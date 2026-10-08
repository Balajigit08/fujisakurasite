import { NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { requireAdmin } from "@/lib/api/auth-guard";
import { serverError } from "@/lib/api/response";
import type { RowDataPacket } from "mysql2";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// GET /api/admin/inquiries
// Returns all client inquiries/messages for admin dashboard
export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, full_name, email, phone, subject, message, status, created_at, updated_at
       FROM inquiries
       ORDER BY created_at DESC`
    );

    return NextResponse.json(
      { inquiries: rows },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/admin/inquiries]", err);
    return serverError();
  }
}