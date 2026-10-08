"use client";

import { useState } from "react";
import { isValidEmail } from "@/lib/validation/email";
import Button from "@/app/components/common/Button";

const LIMIT_EMAIL = 100;

export default function PartnerForm({ t }) {
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerError, setPartnerError] = useState("");
  const [partnerSuccess, setPartnerSuccess] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);

  // Validate and submit newsletter / partner connection email
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setPartnerError("");

    const trimmedEmail = partnerEmail.trim();

    if (trimmedEmail.length > LIMIT_EMAIL) {
      setPartnerError(`Email must be ${LIMIT_EMAIL} characters or fewer.`);
      return;
    }

    if (!trimmedEmail) {
      setPartnerError("Email address is required.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setPartnerError("Please enter a valid email address.");
      return;
    }

    setPartnerLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        setPartnerError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setPartnerSuccess(true);
      setPartnerEmail("");
    } catch {
      setPartnerError("Something went wrong. Please try again.");
    } finally {
      setPartnerLoading(false);
    }
  };

  if (partnerSuccess) {
    return (
      <div className="mt-6 2xl:mt-8 w-full max-w-md px-5 py-4 text-emerald-300 text-sm font-medium text-center">
        ✓ Thank you! We&apos;ll be in touch soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="mt-6 2xl:mt-8 flex w-full flex-col gap-4 2xl:gap-5 max-w-md" noValidate>
     <p className="text-white/60 text-[clamp(11px,0.9vw,18px)] -mt-2 w-full">
        {t ? t("footer.partner_connect") : "Enter your email to connect with us"}
      </p>

      <div className="flex flex-col gap-1">
        <input
          type="email"
          placeholder="Email address..."
          value={partnerEmail}
          maxLength={LIMIT_EMAIL}
          onChange={(e) => {
            setPartnerEmail(e.target.value);
            setPartnerError("");
            if (e.target.value.length >= LIMIT_EMAIL) {
              setPartnerError(`Email must be ${LIMIT_EMAIL} characters or fewer.`);
            }
          }}
          className={`w-full rounded-full bg-white px-6 py-3.5 text-black outline-none text-base border-2 shadow-sm placeholder:text-gray-400 ${
            partnerError ? "border-red-400" : "border-transparent"
          }`}
        />
        {partnerError && (
          <p className="text-xs text-red-600 font-normal text-center px-2">{partnerError}</p>
        )}
      </div>

      <Button
        type="submit"
        loading={partnerLoading}
        disabled={partnerLoading || partnerEmail.length >= LIMIT_EMAIL}
        className="w-full px-6 py-3.5 text-base font-bold shadow-md"
      >
        {partnerLoading ? "Connecting..." : t ? t("footer.connect_us") : "Connect Us"}
      </Button>
    </form>
  );
}
