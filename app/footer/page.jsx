

"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";
import PartnerForm from "./PartnerForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const socials = [
  { name: "Facebook", href: "https://www.facebook.com/Fujisakuratech/", icon: "facebook" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/fujisakuratech/", icon: "linkedin" },
];

const topLinks = [
  { key: "who_we_are", href: "/about" },
  { key: "what_we_do", href: "/we-do" },
  { key: "industries", href: "/industries" },
  { key: "ai_services", href: "/ai-services" },
  { key: "careers", href: "/career" },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      id="app-footer"
      data-navbar="dark"
      className="relative w-full text-white overflow-hidden"
    >
      {/* Background Image & Gradient Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <CldImage
          src="footer-bg"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1124]/85 via-[#0b152d]/70 to-[#040812]/80" />
      </div>

      <div className="relative z-10 overflow-hidden px-[clamp(1.25rem,3.5vw,6rem)] py-[clamp(2.5rem,3.5vw,6rem)]">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1750px] grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 md:grid-cols-2 md:gap-x-12 md:gap-y-10 lg:grid-cols-4 lg:gap-10 xl:gap-14 2xl:gap-20">
          {/* Partner Column */}
          <div className="flex flex-col items-start lg:items-center text-left lg:text-center w-full">
            <h2 className="text-[clamp(0.9rem,1.5vw,1.7rem)] font-bold text-white leading-tight">
              {t("footer.partner_with_us")}
            </h2>
            <PartnerForm t={t} />
          </div>

          {/* Navigation Links Column */}
          <div className="flex flex-col items-start md:items-end lg:items-center text-left w-full">
            <div>
              <h3 className="text-[clamp(1.125rem,1.5vw,1.875rem)] font-bold text-white">
                {t("footer.top_links")}
              </h3>

              <ul className="mt-6 2xl:mt-8 space-y-3 2xl:space-y-4">
                {topLinks.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-[clamp(1rem,1.05vw,1.25rem)] text-white/60 hover:text-[#34CBEA] transition-colors"
                    >
                      {t(`footer.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Information Column */}
          <div className="flex flex-col items-start lg:items-center text-left w-full">
            <div>
              <h3 className="text-[clamp(1.125rem,1.5vw,1.875rem)] font-bold text-white">
                {t("footer.contact_us")}
              </h3>

              <div className="mt-6 2xl:mt-8 space-y-3 2xl:space-y-4">
                <p className="text-[clamp(1rem,1.05vw,1.25rem)] text-white/60">
                  {t("footer.japan_phone")}
                </p>
                <p className="text-[clamp(1rem,1.05vw,1.25rem)] text-white/60">
                  {t("footer.india_phone")}
                </p>
                <p className="break-all sm:break-normal text-[clamp(1rem,1.05vw,1.25rem)] text-white/60">
                  hr@fujisakuratech.com
                </p>
              </div>
            </div>
          </div>

          {/* Social Links Column */}
          <div className="flex flex-col items-start md:items-end lg:items-center text-left lg:text-center w-full">
            <div>
              <h3 className="text-[clamp(1.125rem,1.5vw,1.875rem)] font-bold text-white">
                {t("footer.follow_us")}
              </h3>
            </div>

            <div className="mt-6 2xl:mt-8 flex gap-4 2xl:gap-6">
              {socials.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition transform hover:scale-110"
                >
                  <CldImage
                    src={item.icon}
                    alt={item.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    className="w-[clamp(2rem,2.25vw,2.75rem)] h-[clamp(2rem,2.25vw,2.75rem)]"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 mx-auto flex flex-col sm:flex-row max-w-[1800px] 2xl:max-w-[2050px] justify-between items-center gap-4 border-t border-white/15 px-6 py-6 text-center text-white/60 sm:px-10 md:py-8 2xl:py-10">
        <p className="text-[clamp(0.75rem,0.8vw,0.875rem)]">{t("footer.copyright")}</p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:gap-x-8 2xl:gap-x-12">
          <a
            href="/Privacy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[clamp(0.75rem,0.8vw,0.875rem)] hover:text-[#34CBEA] transition-colors cursor-pointer"
          >
            {t("footer.privacy_policy")}
          </a>
          <a
            href="/company-policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[clamp(0.75rem,0.8vw,0.875rem)] hover:text-[#34CBEA] transition-colors cursor-pointer"
          >
            {t("footer.company_policy")}
          </a>
        </div>
      </div>
    </footer>
  );
}