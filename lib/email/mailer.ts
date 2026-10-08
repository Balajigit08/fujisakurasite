import nodemailer from "nodemailer";

// Single reusable transporter using company SMTP server over SSL (port 465)
const isSecure = process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.fujisakuratech.com",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: isSecure, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.MAIL_FROM,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certs if corporate cert is used
    rejectUnauthorized: false,
  },
});

export interface MailOptions {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendMail(options: MailOptions): Promise<void> {
  const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER || "hr@fujisakuratech.com";

  await transporter.sendMail({
    from:    `"FujiSakura Technologies" <${fromAddress}>`,
    to:      options.to,
    subject: options.subject,
    html:    options.html,
  });
}

