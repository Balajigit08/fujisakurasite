import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[auth/logout]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
