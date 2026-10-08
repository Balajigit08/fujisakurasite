"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import gsap from "gsap";

const mobileVideoUrl = "/videos/homepage-video.mp4";
const mobilePosterUrl = undefined;

const projectImageUrls = {
    industry_expertise: "/FS-images/industry_expertise.jpg",
    "proven-experience": "/FS-images/proven-experience.jpg",
    billingual: "/FS-images/billingual.jpg",
    "japanese-training": "/FS-images/japanese-training.jpg",
};

export default function MobileHeroAndAbout() {
    const { t, lang } = useLanguage();
    const heroSubtitle = t("hero.subtitle");

    const projectsData = useMemo(() => [
        { id: 1, title: t("hero.project_1_title"), desc: t("hero.project_1_desc"), category: t("hero.project_1_category"), imgSrc: "industry_expertise" },
        { id: 2, title: t("hero.project_2_title"), desc: t("hero.project_2_desc"), category: t("hero.project_2_category"), imgSrc: "proven-experience" },
        { id: 3, title: t("hero.project_3_title"), desc: t("hero.project_3_desc"), category: t("hero.project_3_category"), imgSrc: "billingual" },
        { id: 4, title: t("hero.project_4_title"), desc: t("hero.project_4_desc"), category: t("hero.project_4_category"), imgSrc: "japanese-training" },
    ], [t]);

    const [mobileIndex, setMobileIndex] = useState(0);
    const cardsToShow = 1; // Assuming 1 card for mobile view
    const maxIndex = Math.max(0, projectsData.length - cardsToShow);

    const mobileTrackRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        if (Math.abs(distance) > 40) {
            if (distance > 0 && mobileIndex < maxIndex) {
                setMobileIndex((prev) => prev + 1);
            } else if (distance < 0 && mobileIndex > 0) {
                setMobileIndex((prev) => prev - 1);
            }
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    const isFirstMobileTrackRef = useRef(true);
    useEffect(() => {
        if (isFirstMobileTrackRef.current) {
            isFirstMobileTrackRef.current = false;
            return;
        }
        if (mobileTrackRef.current) {
            const shiftPercent = (100 / cardsToShow) * mobileIndex;
            gsap.to(mobileTrackRef.current, {
                xPercent: -shiftPercent,
                duration: 0.6,
                ease: "power3.out",
                force3D: true,
                overwrite: "auto",
            });
        }
    }, [mobileIndex, cardsToShow]);

    return (
        <div className="block lg:hidden w-full bg-[#071036] text-white overflow-hidden">
            <div data-navbar="dark" className="relative w-full h-screen min-h-[500px] overflow-hidden flex flex-col items-center justify-center px-5 py-10 text-center bg-black">
                {mobilePosterUrl && (
                    <img src={mobilePosterUrl} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <video className="absolute inset-0 w-full h-full object-cover pointer-events-none" autoPlay muted loop playsInline preload="metadata" poster={mobilePosterUrl}>
                    <source src={mobileVideoUrl} />
                </video>
                <div className="absolute inset-0 bg-[#004455]/50 z-10" />
                <div className="mobile-sec-1 relative z-20 max-w-xl mx-auto flex flex-col items-center justify-center space-y-3 px-3 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center drop-shadow-md px-1 leading-snug tracking-tight" style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}>
                        {t("hero.subtitle_title")}
                    </h1>
                    <p className="text-sm sm:text-base text-white/90 text-center drop-shadow-sm px-1 mx-auto leading-relaxed max-w-md">
                        {heroSubtitle}
                    </p>
                    <div className="pt-2">
                        <Button href="/we-do" size="sm" className="shadow-md text-xs sm:text-sm py-2 px-5">
                            {t("hero.explore_services")} <span>➜</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div data-navbar="light" className="relative w-full bg-[#F6FFFF] text-black py-12 px-5 flex flex-col items-center justify-center text-center overflow-hidden border-b-[8px] border-[#071036]">
                <div className="mobile-sec-2 relative z-10 max-w-xl mx-auto space-y-3">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black space-y-1 leading-tight tracking-tight">
                        <div className="sentence flex items-center justify-center gap-1.5 flex-wrap">
                            <span className="big-word font-normal">{t("hero.trusted_by")}</span>
                            <span className="big-word font-normal">{t("hero.businesses")}</span>
                        </div>
                        <div className="sentence flex items-center justify-center gap-1.5 flex-wrap">
                            <span className="big-word font-normal">{t("hero.technology")}</span>
                            <span className="big-word font-normal">{t("hero.driven_by")}</span>
                            <span className="big-word font-normal">{t("hero.innovation")}</span>
                        </div>
                    </h2>
                    <p className="text-sm sm:text-base text-black/80 text-center mx-auto mt-2 leading-relaxed max-w-md">
                        {t("hero.about_desc")}
                    </p>
                </div>
            </div>

            <div data-navbar="dark" className="relative w-full text-white py-12 px-0 flex flex-col items-center overflow-hidden bg-[#071036]">
                <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="mobile-sec-3 w-full max-w-2xl mx-auto mb-8 px-6">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold pb-4 text-start sm:text-center text-white leading-snug tracking-tight">
                            {lang === "en" ? (
                                <>{t("hero.why_choose")} <span className="text-[#34CBEA] fuji-text">{t("about.fujisakura")}</span></>
                            ) : (
                                <><span className="text-[#34CBEA] fuji-text">{t("about.fujisakura")}</span>{t("hero.why_choose")}</>
                            )}
                        </h2>
                        <p className="text-base sm:text-xl text-white/80 mb-4 leading-relaxed">
                            {t("hero.why_choose_desc")}
                        </p>
                    </div>

                    <div className="mobile-sec-4 w-full flex flex-col items-center">
                        <div className="w-full overflow-hidden relative px-2 sm:px-6 md:px-10 max-w-5xl" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                            <div ref={mobileTrackRef} className="flex w-full will-change-transform">
                                {projectsData.map((project) => (
                                    <div key={project.id} className="w-full md:w-1/2 flex-shrink-0 px-3 sm:px-5 md:px-4 flex justify-center">
                                        <div className="flex flex-col w-full max-w-[420px] h-[440px] sm:h-[480px] bg-white text-black rounded-tl-[30px] rounded-br-[30px] overflow-hidden shadow-2xl transition-transform duration-500">
                                            <div className="w-full h-1/2 overflow-hidden bg-gray-900 relative">
                                                <Image quality={100} src={projectImageUrls[project.imgSrc]} alt={project.title} fill unoptimized sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
                                            </div>
                                            <div className="p-6 flex flex-col justify-between h-1/2 bg-white">
                                                <div>
                                                    <h3 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-black leading-snug">{project.title}</h3>
                                                    <div className="text-sm sm:text-base font-bold text-gray-800 mb-2 whitespace-nowrap">{project.category}</div>
                                                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{project.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center w-full max-w-[420px] px-6 mt-6 mx-auto">
                            <div className="flex items-center justify-center space-x-2">
                                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                    <button key={idx} onClick={() => setMobileIndex(idx)} className={`h-2.5 rounded-full transition-all duration-300 ${mobileIndex === idx ? "w-8 bg-[#FFB54E]" : "w-2.5 bg-white/40"}`} aria-label={`Go to project card ${idx + 1}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
