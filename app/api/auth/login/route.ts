import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie } from "@/lib/auth/session";

// Bcrypt hash of the admin password.
// To update: node -e "require('bcryptjs').hash('newpassword', 12).then(console.log)"
// Paste the output here to replace the hash below.
const ADMIN_PASSWORD_HASH =
  "$2b$12$5Y2YJ4whrRzF0u/nNJJN4Oe53agupaDA36k2UP9AaJNugunnHz7A2";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const normalizedInputEmail = email.trim().toLowerCase();
    const normalizedAdminEmail = adminEmail.trim().toLowerCase();

    const emailMatch = normalizedInputEmail === normalizedAdminEmail;
    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await signToken({ role: "admin", email: normalizedAdminEmail });
    await setSessionCookie(token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
