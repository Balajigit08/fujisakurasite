"use client";

import { useRef, useMemo } from "react";
import { CldImage } from "next-cloudinary";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useDeferredScrollAnimation } from "@/app/components/common/useDeferredScrollAnimation";

export default function Directors() {
    const { t } = useLanguage();
    const mobileSectionRef = useRef(null);
    const desktopSectionRef = useRef(null);

    const mobileDirectors = useMemo(() => [
        { name: t("directors.yozo_minowa"), title1: t("directors.representative"), title: t("directors.director"), img: "minowa-san", alt: "Minowa" },
        { name: t("directors.satheesh_chelliah"), title: t("directors.director"), img: "sat-san", alt: "Sat" },
        { name: t("directors.satheeshkannan"), name1: t("directors.chandrasekaran"), title: t("directors.director"), img: "kannan-san", alt: "Kannan" },
        { name: t("directors.madhavaramanujam"), name1: t("directors.rajendran"), title: t("directors.director"), img: "madhavan-san", alt: "Madavan" },
        { name: t("directors.pazhamalai"), name1: t("directors.jagadeesan"), title: t("directors.director"), img: "paz-san", alt: "Paz" },
    ], [t]);

    const desktopDirectors = useMemo(() => [
        { name: t("directors.satheesh_chelliah"), title: t("directors.director"), img: "sat-san", alt: "Sat" },
        { name: t("directors.satheeshkannan"), name1: t("directors.chandrasekaran"), title: t("directors.director"), img: "kannan-san", alt: "Kannan" },
        { name: t("directors.yozo_minowa"), title1: t("directors.representative"), title: t("directors.director"), img: "minowa-san", alt: "Minowa" },
        { name: t("directors.madhavaramanujam"), name1: t("directors.rajendran"), title: t("directors.director"), img: "madhavan-san", alt: "Madavan" },
        { name: t("directors.pazhamalai"), name1: t("directors.jagadeesan"), title: t("directors.director"), img: "paz-san", alt: "Paz" },
    ], [t]);

    return (
        <div id="directors-section" data-navbar="light" className="w-full">
            {/* Mobile / Tablet View */}
            <div ref={mobileSectionRef} className="block lg:hidden w-full bg-[#74D1EF] text-black py-12 px-0 relative overflow-hidden">
                <div className="w-full flex flex-col items-center text-center mb-8 px-5 gap-1 mt-2">
                    <p className="text-[#1a3a4a] font-bold text-lg tracking-wider uppercase">
                        {t("directors.our_board_of")}
                    </p>
                    <h2
                        className="text-[#ffffff] text-4xl sm:text-5xl font-extrabold uppercase leading-none tracking-tight"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                        {t("directors.directors")}
                    </h2>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto px-6">
                    {mobileDirectors.map(({ img, alt, name, title, name1, title1 }) => (
                        <div
                            key={img}
                            className="w-full flex flex-col items-center text-center md:last:col-span-2 md:last:max-w-[280px] sm:md:last:max-w-[320px] md:last:mx-auto lg:last:col-span-1 lg:last:max-w-none"
                        >
                            <div className="w-[70vw] max-w-[300px] sm:max-w-[340px] aspect-square overflow-hidden rounded-2xl relative">
                                <CldImage
                                    className="object-cover object-top"
                                    src={img}
                                    alt={alt || name}
                                    fill
                                    sizes="(max-width: 640px) 300px, 340px"
                                />
                            </div>
                            <div className="mt-4 px-6 w-full flex flex-col items-center text-center">
                                <p className="text-black text-[1.25rem] sm:text-[1.35rem] font-bold leading-tight break-words">
                                    {name}
                                    {name1 && (
                                        <>
                                            <br />
                                            {name1}
                                        </>
                                    )}
                                </p>
                                <p className="mt-1 text-[1rem] sm:text-[1.1rem] font-semibold text-black leading-tight">
                                    {title1 ? `${title1} ${title}` : title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop Pinned View */}
            <div
                ref={desktopSectionRef}
                className="hidden lg:flex w-full flex-col items-center justify-center bg-[#74D1EF] h-screen relative z-10 overflow-hidden"
            >
                <div className="w-full max-w-[1800px] 2xl:max-w-[2050px] mx-auto px-6 text-center flex flex-col items-center justify-center h-full">
                    <p className="text-[#1a3a4a] font-bold text-[clamp(1rem,1.2vw,1.5rem)] mb-1">
                        {t("directors.our_board_of")}
                    </p>
                    <h2 className="text-[#ffffff] text-[clamp(2.25rem,4vw,5rem)] font-extrabold uppercase mb-[clamp(1.5rem,2.5vw,3rem)] leading-none">
                        {t("directors.directors")}
                    </h2>

                    <div className="w-full flex justify-center items-center">
                        <div className="flex flex-row flex-nowrap justify-center items-start gap-4 xl:gap-6 2xl:gap-8 px-4 w-full">
                            {desktopDirectors.map(({ img, alt, name, title, name1, title1 }) => (
                                <div
                                    key={img}
                                    className="director-card flex flex-col items-center flex-shrink-0 w-[clamp(190px,18vw,335px)] text-center"
                                >
                                    <div className="overflow-hidden rounded-[clamp(1.5rem,2vw,2.5rem)] w-[clamp(185px,17vw,325px)] aspect-square mx-auto relative">
                                        <CldImage
                                            className="object-cover object-center"
                                            src={img}
                                            alt={alt || name}
                                            fill
                                            sizes="(max-width: 1280px) 230px, (max-width: 1536px) 280px, 350px"
                                        />
                                    </div>
                                    <div className="mt-4 sm:mt-5 w-full flex flex-col items-center text-center">
                                        <p className="text-black text-[clamp(1.05rem,1.25vw,1.45rem)] font-bold leading-tight break-words">
                                            {name}
                                            {name1 && (
                                                <>
                                                    <br />
                                                    {name1}
                                                </>
                                            )}
                                        </p>
                                        <p className="mt-1.5 text-[clamp(0.875rem,1.05vw,1.15rem)] font-semibold text-black/80 leading-tight break-words whitespace-normal">
                                            {title1 ? `${title1} ${title}` : title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}