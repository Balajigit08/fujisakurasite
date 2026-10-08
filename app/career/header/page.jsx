"use client";

import { CldImage } from "next-cloudinary";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CareerHeader() {
    const { t } = useLanguage();

    return (
        <section id="career-header-section" data-navbar="light" className="bg-[#FFFFFF] w-full pt-20 sm:pt-32 lg:pt-[clamp(5.5rem,8vw,7.5rem)] relative overflow-hidden mb-8 lg:mb-15 font-sans">
            <div className="w-full lg:w-[clamp(70%,70vw,1280px)] max-w-[1800px] 2xl:max-w-[2050px] mx-auto px-5 md:px-10 lg:px-12 relative z-10 pt-5">
                <div className="w-full max-w-4xl lg:max-w-[clamp(78%,70vw,1080px)] mx-auto text-center">
                    <h1 className="flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-3 md:gap-x-[clamp(0.5rem,1vw,1rem)] mb-4 sm:mb-6 md:mb-[clamp(1rem,2vw,2.5rem)] text-center">
                        <span className="whitespace-nowrap text-3xl sm:text-4xl md:text-[clamp(1.875rem,3vw,4.5rem)] font-normal text-[#1B1B1B]">
                            {t("career.header_prefix") || "Build Your Future"}
                        </span>{" "}
                        <span className="whitespace-nowrap text-4xl sm:text-5xl md:text-[clamp(3rem,5vw,6rem)] font-bold text-[#34CBEA] leading-none">
                            {t("career.header_highlight") || "With Us"}
                        </span>
                    </h1>
                    <div className="text-[#2E2E2E] text-base sm:text-lg md:text-[clamp(1.125rem,1.5vw,2.2rem)] leading-relaxed md:leading-[clamp(1.5,1.5vw,1.6)] font-normal max-w-4xl lg:max-w-[clamp(78%,70vw,1080px)] mx-auto">
                        <p>
                            {t("career.header_desc") || "At FujiSakura Technologies, we believe that great people build great technology. We are committed to creating innovative digital solutions while fostering a collaborative, inclusive, and growth-oriented workplace."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row w-full max-w-[1800px] 2xl:max-w-[2050px] mx-auto items-stretch gap-8 lg:gap-12 px-6 sm:px-8 md:px-12 lg:px-16 pt-8 sm:pt-12">
                <div className="w-full lg:w-1/2 flex flex-col justify-between">
                    <div>
                        <h2 className="font-bold text-xl sm:text-2xl md:text-[clamp(1.5rem,2vw,2.5rem)] text-[#1B1B1B] pb-2 sm:pb-3 leading-tight tracking-tight">
                            {t("career.why_join_us") || "Why Join Us?"}
                        </h2>
                        <ul className="space-y-2.5 sm:space-y-3 text-sm sm:text-base md:text-[clamp(1.05rem,1.25vw,1.45rem)] text-[#2E2E2E] leading-relaxed font-normal">
                            <li>{t("career.why_join_1") || "1. Work with modern technologies and innovative solutions."}</li>
                            <li>{t("career.why_join_2") || "2. Contribute to global projects across diverse industries."}</li>
                            <li>{t("career.why_join_3") || "3. Learn, grow, and advance your career through continuous development."}</li>
                        </ul>
                    </div>

                    <div className="flex flex-row items-end justify-between gap-3 sm:gap-6 mt-8 sm:mt-10 lg:mt-6">
                        <div className="flex flex-col justify-end min-w-0">
                            <h2 className="font-bold text-xl sm:text-2xl md:text-[clamp(1.5rem,2vw,2.5rem)] text-[#1B1B1B] pb-2 sm:pb-3 leading-tight tracking-tight whitespace-nowrap">
                                {t("career.core_values") || "Our Core Values"}
                            </h2>
                            <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.45rem)] text-[#2E2E2E] leading-relaxed md:leading-[clamp(1.5,1.5vw,1.6)] font-normal">
                                <li className="whitespace-nowrap">{t("career.value_innovation") || "+ Innovation"}</li>
                                <li className="whitespace-nowrap">{t("career.value_collaboration") || "+ Collaboration"}</li>
                                <li className="whitespace-nowrap">{t("career.value_excellence") || "+ Excellence"}</li>
                            </ul>
                        </div>

                        <div className="w-[125px] sm:w-[160px] md:w-[clamp(160px,15vw,260px)] aspect-[4/3] rounded-tl-[clamp(20px,3vw,44px)] rounded-br-[clamp(20px,3vw,44px)] rounded-tr-none rounded-bl-none overflow-hidden relative shrink-0 shadow-md">
                            <CldImage
                                src="career-small"
                                alt="Career Team"
                                fill
                                sizes="(max-width: 1024px) 200px, 260px"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-stretch">
                    <div className="w-full aspect-[16/10] lg:aspect-auto lg:h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[420px] rounded-tl-[clamp(30px,4vw,50px)] rounded-br-[clamp(30px,4vw,50px)] rounded-tr-none rounded-bl-none overflow-hidden relative shadow-lg">
                        <CldImage
                            src="career-big"
                            alt="Career Workspace"
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
