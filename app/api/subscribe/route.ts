import { NextRequest } from "next/server";
import { badRequest, created, serverError } from "@/lib/api/response";
import { sendMail } from "@/lib/email/mailer";
import { partnerSubscribeTemplate } from "@/lib/email/templates";
import { isValidEmail } from "@/lib/validation/email";

// POST /api/subscribe
// Public endpoint — handles Partner With Us email subscription from footer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.toString().trim();

    if (!email) {
      return badRequest("Email address is required.");
    }

    if (!isValidEmail(email)) {
      return badRequest("Please enter a valid email address.");
    }

    // Send notification to HR & Partner Relation team
    const recipients = [process.env.MAIL_TO, process.env.PARTNER_MAIL_TO]
      .filter(Boolean)
      .join(", ");

    if (recipients) {
      const { subject, html } = partnerSubscribeTemplate({ email });
      sendMail({ to: recipients, subject, html }).catch((err) =>
        console.error("[subscribe] Email notification failed:", err)
      );
    }

    return created({ success: true });
  } catch (err) {
    console.error("[POST /api/subscribe]", err);
    return serverError();
  }
}
