"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Calculate sticky header offset row height across screen widths
const getRowHeight = () => {
    if (typeof window === "undefined") return 100;

    if (window.innerWidth >= 7680) return 400;
    if (window.innerWidth >= 3840) return 220;
    if (window.innerWidth >= 2560) return 160;
    if (window.innerWidth >= 1920) return 140;
    if (window.innerWidth >= 1536) return 120;
    if (window.innerWidth >= 1280) return 110;
    if (window.innerWidth >= 1024) return 100;
    if (window.innerWidth >= 768) return 90;
    return 80;
};

export default function StackScroll() {
    const { t, lang } = useLanguage();

    const sections = [
        {
            index: 1,
            title: t("certificate.iso_9001_title"),
            subtitle: t("certificate.iso_9001_subtitle"),
            lede: t("certificate.iso_9001_desc"),
            cardLabel: t("certificate.iso_9001_label"),
            tag: t("certificate.certification"),
            image1: "/FS-images/ISO_2015.png",
            image: "/FS-images/ISO-9001-2015.jpg",
        },
        {
            index: 2,
            title: t("certificate.iso_27001_title"),
            subtitle: t("certificate.iso_27001_subtitle"),
            lede: t("certificate.iso_27001_desc"),
            cardLabel: t("certificate.iso_27001_label"),
            tag: t("certificate.certification"),
            image1: "/FS-images/ISO_2022.png",
            image: "/FS-images/ISO-27001-2002.jpg",
        },
        {
            index: 3,
            title: t("certificate.nasscom_title"),
            subtitle: t("certificate.nasscom_subtitle"),
            lede: t("certificate.nasscom_desc"),
            cardLabel: t("certificate.nasscom_label"),
            tag: t("certificate.membership"),
            image1: "/FS-images/Nasscom-logo.png",
            image: "/FS-images/nasscom.jpg",
        },
    ];

    const containerRef = useRef(null);
    const headingRef = useRef(null);

    const [mobileIndex, setMobileIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(1);
    const mobileTrackRef = useRef(null);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Update visible card count on resize
    useEffect(() => {
        const handleResize = () => {
            setCardsToShow(window.innerWidth >= 768 ? 2 : 1);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const maxIndex = Math.max(0, sections.length - cardsToShow);

    // Keep mobile carousel index within bounds
    useEffect(() => {
        if (mobileIndex > maxIndex) {
            setMobileIndex(maxIndex);
        }
    }, [maxIndex, mobileIndex]);

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

    // Animate mobile track translation on index change
    useEffect(() => {
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

    // Desktop GSAP ScrollTrigger for pinned stacked certificate cards
    useGSAP(() => {
        if (!containerRef.current || !headingRef.current) return;

        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            ScrollTrigger.create({
                trigger: headingRef.current,
                start: () => {
                    const navbar =
                        document.querySelector("header") ||
                        document.querySelector("nav") ||
                        document.querySelector(".navbar");
                    const navbarHeight = navbar?.offsetHeight || 80;
                    return `top top+=${navbarHeight}`;
                },
                endTrigger: containerRef.current,
                end: "bottom bottom",
                pin: true,
                pinSpacing: false,
                invalidateOnRefresh: true,
                anticipatePin: 1,
            });

            const cards = gsap.utils.toArray(".stack-section", containerRef.current);

            cards.forEach((card, index) => {
                ScrollTrigger.create({
                    trigger: card,
                    start: () => {
                        const navbar =
                            document.querySelector("header") ||
                            document.querySelector("nav") ||
                            document.querySelector(".navbar");
                        const navbarHeight = navbar?.offsetHeight || 80;
                        const headingHeight = headingRef.current?.offsetHeight || 0;
                        return `top top+=${navbarHeight + headingHeight + index * getRowHeight()}`;
                    },
                    endTrigger: containerRef.current,
                    end: "bottom bottom",
                    pin: true,
                    pinSpacing: false,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                });
            });
        });

        return () => mm.revert();
    }, { scope: containerRef, dependencies: [lang], revertOnUpdate: true });

    return (
        <div
            id="certificate-section"
            data-navbar="light"
            ref={containerRef}
            className="relative w-full pb-0 lg:pb-[10vh] lg:mb-80 2xl:mb-96"
        >
            <div
                data-navbar="light"
                ref={headingRef}
                className="pt-6 sm:pt-10 relative z-[1] bg-white pb-3 lg:pb-6 px-4 max-w-[1800px] 2xl:max-w-[2050px] mx-auto"
            >
                <h1 className="flex flex-wrap items-center justify-center mb-2 lg:mb-5 text-center">
                    <span className="text-2xl sm:text-3xl md:text-[clamp(1.875rem,3vw,4.5rem)] font-normal text-[#1B1B1B]">
                        {t("certificate.title_prefix")}
                    </span>
                </h1>
            </div>

            {/* Mobile / Tablet View */}
            <div className="block lg:hidden w-full py-4 px-0 relative overflow-hidden">
                <div
                    className="w-full overflow-hidden relative px-2 sm:px-6 md:px-10 max-w-6xl mx-auto"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        ref={mobileTrackRef}
                        className="flex w-full will-change-transform"
                    >
                        {sections.map((s) => (
                            <div key={s.index} className="w-full md:w-1/2 flex-shrink-0 px-3 sm:px-4 flex flex-col justify-between">
                                <div className="w-full h-full bg-white border border-neutral-200 rounded-3xl p-5 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
                                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">
                                            {s.tag}
                                        </span>
                                        <span className="text-xl sm:text-2xl font-extrabold text-neutral-300">
                                            0{s.index}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3.5">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl p-2 flex items-center justify-center">
                                            <Image
                                                src={s.image1}
                                                alt={s.title}
                                                width={64}
                                                height={64}
                                                unoptimized
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-sm sm:text-lg font-extrabold text-neutral-900 leading-tight">
                                                {s.title}
                                            </h3>
                                            {s.subtitle && (
                                                <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-0.5">
                                                    {s.subtitle}
                                                </p>
                                            )}
                                            <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                                                {s.cardLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed font-normal">
                                        {s.lede}
                                    </p>

                                    <Image
                                        src={s.image}
                                        alt={s.title}
                                        width={600}
                                        height={400}
                                        unoptimized
                                        className="w-full h-auto rounded-xl object-cover border border-neutral-100"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center max-w-[420px] mx-auto px-6 mt-6 w-full">
                    <div className="flex items-center space-x-2">
                        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setMobileIndex(idx)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${mobileIndex === idx ? "w-8 bg-[#ffb54e]" : "w-2.5 bg-neutral-300"
                                    }`}
                                aria-label={`Go to certificate ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop Stacked Sections */}
            <div className="hidden lg:block w-full">
                {sections.map((s, i) => (
                    <section
                        key={s.index}
                        data-navbar="light"
                        className="stack-section min-h-[480px] lg:h-[80vh] w-full mb-6 lg:mb-0"
                        style={{ zIndex: i + 2 }}
                    >
                        <div className="stack-section__inner h-full bg-white border-t border-neutral-200 p-6 md:p-6 2xl:p-12 origin-top shadow-sm max-w-[1800px] 2xl:max-w-[2050px] mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] lg:grid-cols-[1fr_2fr] gap-10 h-full">
                                <div className="flex flex-col items-center h-full w-full">
                                    <div className="grid grid-cols-[2.5rem_auto] md:grid-cols-[3rem_auto] 2xl:grid-cols-[1rem_auto] items-center gap-4 md:gap-8 w-full max-w-[500px] mx-auto">
                                        <span className="text-xl md:text-2xl 2xl:text-6xl text-neutral-400 font-medium text-right">
                                            {s.index}
                                        </span>
                                        <div className="flex flex-col text-left">
                                            <h2 className="text-[clamp(1.5rem,1.8vw,3rem)] font-semibold tracking-tight text-neutral-900 leading-none">
                                                {s.title}
                                            </h2>
                                            {s.subtitle && (
                                                <p className="text-[clamp(13px,1.4vw,22px)] font-medium text-neutral-600 mt-3">
                                                    {s.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-7 md:mt-6 flex justify-center w-full">
                                        <Image
                                            src={s.image1}
                                            alt={s.title}
                                            width={260}
                                            height={260}
                                            unoptimized
                                            className="w-[100px] md:w-[150px] 2xl:w-[200px] h-auto object-center 2xl:-ml-15"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-4 min-h-[250px]">
                                    {s.lede && (
                                        <p className="certificate-lede text-[clamp(1.125rem,1.25vw,1.5rem)] leading-[1.5] font-medium text-neutral-900">
                                            {s.lede}
                                        </p>
                                    )}
                                    <div className="flex-1 relative overflow-hidden rounded-md border border-neutral-100 min-h-[180px]">
                                        <Image
                                            src={s.image}
                                            alt={s.title}
                                            unoptimized
                                            fill
                                            sizes="(max-width: 1024px) 95vw, 400px"
                                            className="object-cover object-center"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}