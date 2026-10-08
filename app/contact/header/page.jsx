"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ContactHeader() {
    const { t } = useLanguage();

    return (
        <section id="contact-header-section" data-navbar="light" className="bg-[#FFFFFF] w-full pt-20 sm:pt-32 lg:pt-[clamp(5.5rem,8vw,7.5rem)] relative overflow-hidden">
            <div className="w-full lg:w-[clamp(70%,70vw,1280px)] max-w-[1800px] 2xl:max-w-[2050px] mx-auto px-5 md:px-10 lg:px-12 relative z-10 pt-5">
                <div className="w-full max-w-4xl lg:max-w-[clamp(78%,70vw,1080px)] mx-auto text-center">
                    <h1 className="flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-3 md:gap-x-[clamp(0.5rem,1vw,1rem)] mb-4 sm:mb-6 md:mb-[clamp(1rem,2vw,2.5rem)] text-center">
                        <span className="whitespace-nowrap text-3xl sm:text-4xl md:text-[clamp(1.875rem,3vw,4.5rem)] font-normal text-[#1B1B1B]">
                            {t("contact.get_in_touch_prefix")}
                        </span>{" "}
                        <span className="whitespace-nowrap text-4xl sm:text-5xl md:text-[clamp(3rem,5vw,6rem)] font-bold text-[#34CBEA] leading-none">
                            {t("contact.get_in_touch_highlight")}
                        </span>
                    </h1>
                    <div className="text-[#2E2E2E] text-base sm:text-lg md:text-[clamp(1.125rem,1.5vw,2.2rem)] leading-relaxed md:leading-[clamp(1.5,1.5vw,1.6)] font-normal max-w-4xl lg:max-w-[clamp(78%,70vw,1080px)] mx-auto">
                        <p>
                            {t("contact.get_in_touch_desc")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
