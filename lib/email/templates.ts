// ── Job Application notification ─────────────────────────────────────────────
export function jobApplicationTemplate(data: {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  qualification: string;
  dateOfBirth: string;
  isJpBilingual: boolean;
  jpLevel: string | null;
}): { subject: string; html: string } {
  return {
    subject: `New Job Application — ${data.jobTitle}`,
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: #1e3a8a; padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: left;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">New Job Application</h1>
          <p style="color: #ffffff; margin: 4px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">FujiSakura Technologies — Careers</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 24px; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;">
            Applying for: <span style="color: #1e3a8a; font-weight: 800;">${data.jobTitle}</span>
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 12px 0; color: #475569; font-weight: 500; width: 140px;">Full Name</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;">${data.fullName}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #475569; font-weight: 500;">Email Address</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;"><a href="mailto:${data.email}" style="color: #1e3a8a; text-decoration: none;">${data.email}</a></td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #475569; font-weight: 500;">Phone Number</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;">${data.phone}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #475569; font-weight: 500;">Date of Birth</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;">${data.dateOfBirth}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #475569; font-weight: 500;">Qualification</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;">${data.qualification}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #475569; font-weight: 500;">JP Bilingual</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;">${data.isJpBilingual ? `Yes (${data.jpLevel})` : "No"}</td>
            </tr>
          </table>
          <div style="margin-top: 28px; padding: 16px 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 13px; color: #1e3a8a; font-weight: 500; text-align: center; line-height: 1.5;">
            🔒 This application has been securely recorded. Please log into the Admin Panel to download the resume and manage candidate status.
          </div>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; font-weight: 500;">FujiSakura Technologies Pvt. Ltd. — Admin Notification</p>
      </div>
    `,
  };
}

// ── Contact form notification ─────────────────────────────────────────────────
export function contactInquiryTemplate(data: {
  fullName: string;
  email: string;
  phone: string;
  subject: string | null;
  message: string;
}): { subject: string; html: string } {
  return {
    subject: `New Contact Enquiry${data.subject ? ` — ${data.subject}` : ""}`,
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: #1e3a8a; padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: left;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">New Contact Enquiry</h1>
          <p style="color: #ffffff; margin: 4px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">FujiSakura Technologies — Contact Form</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 12px 0; color: #475569; font-weight: 500; width: 140px;">Full Name</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;">${data.fullName}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #475569; font-weight: 500;">Email Address</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;"><a href="mailto:${data.email}" style="color: #1e3a8a; text-decoration: none;">${data.email}</a></td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #475569; font-weight: 500;">Phone Number</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;">${data.phone}</td>
            </tr>
            ${data.subject ? `
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #475569; font-weight: 500;">Subject</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600; text-align: right;">${data.subject}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top: 24px;">
            <p style="color: #475569; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px;">Message Details</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; color: #0f172a; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</div>
          </div>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; font-weight: 500;">FujiSakura Technologies Pvt. Ltd. — Admin Notification</p>
      </div>
    `,
  };
}

// ── Partner / Subscribe notification ─────────────────────────────────────────
export function partnerSubscribeTemplate(data: {
  email: string;
}): { subject: string; html: string } {
  return {
    subject: `New Partner Subscription — ${data.email}`,
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: #1e3a8a; padding: 28px 32px; border-radius: 12px 12px 0 0; text-align: left;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">New Partner Subscription</h1>
          <p style="color: #ffffff; margin: 4px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">FujiSakura Technologies — Footer Connection</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 15px; color: #0f172a; line-height: 1.5; margin: 0 0 20px;">A new connection request has been received via the <strong>Partner With Us</strong> section in the footer.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; text-align: center; margin-bottom: 12px;">
            <a href="mailto:${data.email}" style="font-size: 18px; font-weight: 700; color: #166534; text-decoration: none;">${data.email}</a>
          </div>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; font-weight: 500;">FujiSakura Technologies Pvt. Ltd. — Admin Notification</p>
      </div>
    `,
  };
}
