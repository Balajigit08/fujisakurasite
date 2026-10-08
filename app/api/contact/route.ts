import { NextRequest } from "next/server";
import pool from "@/lib/db/connection";
import { badRequest, created, serverError } from "@/lib/api/response";
import { sendMail } from "@/lib/email/mailer";
import { contactInquiryTemplate } from "@/lib/email/templates";
import { isValidEmail } from "@/lib/validation/email";

// POST /api/contact
// Public endpoint — saves contact form submission to the inquiries table
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, subject, message, captchaToken } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!fullName?.trim()) missing.push("full_name");
    if (!email?.trim())    missing.push("email");
    if (!phone?.trim())    missing.push("phone");
    if (!message?.trim())  missing.push("message");

    if (missing.length > 0) {
      return badRequest(`Missing required fields: ${missing.join(", ")}.`);
    }

    // reCAPTCHA verification
    if (!captchaToken) {
      return badRequest("Please complete the reCAPTCHA verification.");
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const verifyRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`,
        { method: "POST" }
      );
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return badRequest("reCAPTCHA verification failed. Please try again.");
      }
    }

    // Email format validation
    if (!isValidEmail(email.trim())) {
      return badRequest("Invalid email address.");
    }

    // Save to DB
    const conn = await pool.getConnection();
    try {
      await conn.query("INSERT INTO inquiries SET ?", {
        full_name: fullName.trim(),
        email:     email.trim(),
        phone:     phone.trim(),
        subject:   subject?.trim() || null,
        message:   message.trim(),
        status:    "new",
      });
    } finally {
      conn.release();
    }

    // Send email notification to HR (non-blocking)
    const mailTo = process.env.MAIL_TO;
    if (mailTo) {
      const { subject: mailSubject, html } = contactInquiryTemplate({
        fullName: fullName.trim(),
        email:    email.trim(),
        phone:    phone.trim(),
        subject:  subject?.trim() || null,
        message:  message.trim(),
      });
      sendMail({ to: mailTo, subject: mailSubject, html }).catch((err) =>
        console.error("[contact] Email notification failed:", err)
      );
    }

    return created({ success: true });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return serverError();
  }
}
