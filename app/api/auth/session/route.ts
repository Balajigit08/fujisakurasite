import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json(
      { authenticated: true, email: session.email, role: session.role },
      { status: 200 }
    );
  } catch (err) {
    console.error("[auth/session]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
