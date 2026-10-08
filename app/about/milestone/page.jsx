"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP);
}

export default function Milestone() {
    const { t } = useLanguage();
    const milestonesData = t("milestone.data");
    const MILESTONES = Array.isArray(milestonesData) ? milestonesData : [];

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [itemWidthDesktop, setItemWidthDesktop] = useState(0);
    const [itemWidthMobile, setItemWidthMobile] = useState(0);

    const viewportRef = useRef(null);
    const mobileViewportRef = useRef(null);
    const contentRef = useRef(null);
    const mobileContentRef = useRef(null);

    const total = MILESTONES.length;
    const active = MILESTONES[activeIndex] || { events: [] };

    // Measure timeline item widths responsively
    useEffect(() => {
        const updateWidths = () => {
            const w = window.innerWidth;
            if (viewportRef.current) {
                setItemWidthDesktop(viewportRef.current.clientWidth / 4);
            }
            if (mobileViewportRef.current) {
                const visibleMobile = w >= 768 ? 3 : 2;
                setItemWidthMobile(mobileViewportRef.current.clientWidth / visibleMobile);
            }
        };

        updateWidths();

        const roDesktop = viewportRef.current ? new ResizeObserver(updateWidths) : null;
        if (viewportRef.current && roDesktop) roDesktop.observe(viewportRef.current);

        const roMobile = mobileViewportRef.current ? new ResizeObserver(updateWidths) : null;
        if (mobileViewportRef.current && roMobile) roMobile.observe(mobileViewportRef.current);

        window.addEventListener("resize", updateWidths);
        const timer = setTimeout(updateWidths, 100);

        return () => {
            clearTimeout(timer);
            if (roDesktop) roDesktop.disconnect();
            if (roMobile) roMobile.disconnect();
            window.removeEventListener("resize", updateWidths);
        };
    }, []);

    // Auto-advance autoplay timer if enabled
    useEffect(() => {
        if (!isPlaying) return;
        const id = setInterval(() => {
            setActiveIndex((i) => {
                if (i >= total - 1) {
                    setIsPlaying(false);
                    return i;
                }
                return i + 1;
            });
        }, 3000);
        return () => clearInterval(id);
    }, [isPlaying, total]);

    // Animate content fade-in on active year change
    useGSAP(() => {
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
            );
        }
        if (mobileContentRef.current) {
            gsap.fromTo(
                mobileContentRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
            );
        }
    }, { dependencies: [activeIndex] });

    // Subtle continuous text wave animation
    useGSAP(() => {
        const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: 1,
        });

        tl.to(".animated-text", { rotation: 5, duration: 0.08, ease: "sine.inOut", transformOrigin: "center center" })
            .to(".animated-text", { rotation: -5, duration: 0.08, ease: "sine.inOut" })
            .to(".animated-text", { rotation: 4, duration: 0.08, ease: "sine.inOut" })
            .to(".animated-text", { rotation: -4, duration: 0.08, ease: "sine.inOut" })
            .to(".animated-text", { rotation: 0, duration: 0.08, ease: "sine.inOut" });
    }, []);

    const goPrev = () => {
        setIsPlaying(false);
        setActiveIndex((i) => Math.max(i - 1, 0));
    };

    const goNext = () => {
        setIsPlaying(false);
        setActiveIndex((i) => Math.min(i + 1, total - 1));
    };

    return (
        <section id="milestone-section">
            <div
                data-navbar="light"
                className="relative z-0 isolate w-full min-h-0 lg:min-h-screen py-4 sm:py-6 lg:py-0 overflow-hidden flex flex-col justify-center pt-0"
            >
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image quality={100}
                        src="/FS-images/milestone.jpg"
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </div>

                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/0 via-black/0 to-[#121d2d]/90 pointer-events-none" />

                {/* Desktop View */}
                <div className="hidden lg:flex relative z-10 w-full px-6 lg:px-20 2xl:px-32 flex-col justify-center max-w-full m-0">
                    <div className="relative w-full">
                        <div
                            ref={viewportRef}
                            className="overflow-hidden pt-8 lg:pt-0 w-full"
                        >
                            <div
                                className="flex items-end min-h-[3.5rem] lg:min-h-[4.5rem] 2xl:min-h-[5.5rem]"
                                style={{
                                    transform: `translateX(-${activeIndex * itemWidthDesktop}px)`,
                                    transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)",
                                    willChange: "transform",
                                }}
                            >
                                {MILESTONES.map((m, i) => {
                                    const isActive = i === activeIndex;
                                    return (
                                        <button
                                            key={m.year}
                                            onClick={() => {
                                                setIsPlaying(false);
                                                setActiveIndex(i);
                                            }}
                                            style={{ width: itemWidthDesktop || undefined, flex: itemWidthDesktop ? "none" : "0 0 25%" }}
                                            className="shrink-0 flex flex-col items-start justify-end text-left focus:outline-none cursor-pointer"
                                        >
                                            <span
                                                className={`leading-none text-3xl lg:text-4xl 2xl:text-5xl origin-bottom-left will-change-transform ${isActive ? "text-[#FFB54E] font-normal" : "text-white/70 hover:text-white"
                                                    }`}
                                                style={{
                                                    transform: isActive ? "scale(2)" : "scale(1)",
                                                    transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1), color 1s ease",
                                                    transformOrigin: "bottom left",
                                                }}
                                            >
                                                {m.year}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative mt-4 lg:mt-2 w-full border-b border-white">
                            <div className="overflow-hidden h-5">
                                <div
                                    className="flex h-full"
                                    style={{
                                        transform: `translateX(-${activeIndex * itemWidthDesktop}px)`,
                                        transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)",
                                        willChange: "transform",
                                    }}
                                >
                                    {MILESTONES.map((m) => (
                                        <div
                                            key={m.year}
                                            style={{ width: itemWidthDesktop || undefined, flex: itemWidthDesktop ? "none" : "0 0 25%" }}
                                            className="shrink-0 flex justify-start items-end"
                                        >
                                            <div className="w-px h-7 bg-white" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-8 lg:gap-16 mt-12 lg:mt-5 w-full">
                        <div ref={contentRef} className="w-1/2 max-w-lg min-h-[clamp(280px,20vw,380px)] flex flex-col justify-center">
                            <div className="space-y-5 lg:space-y-3">
                                {active.events.map((event, j) => (
                                    <div key={j}>
                                        <p className="text-white text-[clamp(1rem,1.5vw,1.875rem)] font-semibold">
                                            {event.date}
                                        </p>
                                        <p className="text-white/70 text-[clamp(1.125rem,1.25vw,1.5rem)] leading-[1.55] whitespace-pre-line">
                                            {event.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6 w-vw">
                            <div>
                                <h1 className="animated-text text-[clamp(2.25rem,4.5vw,4.5rem)] flex items-center justify-center mb-0 text-white font-semibold">
                                    <span className="text-[#9BE7FF]">
                                        {t("milestone.milestones")}
                                    </span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex gap-5">
                            <button
                                onClick={goPrev}
                                disabled={activeIndex === 0}
                                className="flex items-center justify-center w-[clamp(4.5rem,5vw,6rem)] h-[clamp(4.5rem,5vw,6rem)] rounded-full border-2 border-[#FFFFFF] text-white disabled:opacity-20 transition-all hover:bg-white/10 cursor-pointer active:scale-95"
                                aria-label="Previous milestone"
                            >
                                <MdKeyboardArrowLeft className="text-3xl 2xl:text-4xl" />
                            </button>

                            <button
                                onClick={goNext}
                                disabled={activeIndex === total - 1}
                                className="flex items-center justify-center w-[clamp(4.5rem,5vw,6rem)] h-[clamp(4.5rem,5vw,6rem)] rounded-full border-2 border-[#FFFFFF] text-white disabled:opacity-20 transition-all hover:bg-white/10 cursor-pointer active:scale-95"
                                aria-label="Next milestone"
                            >
                                <MdKeyboardArrowRight className="text-3xl 2xl:text-4xl" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile / Tablet View */}
                <div className="flex lg:hidden relative z-10 w-full px-5 sm:px-10 flex-col justify-center max-w-4xl mx-auto py-2 sm:py-4">
                    <div className="relative w-full mb-4 sm:mb-6">
                        <div ref={mobileViewportRef} className="overflow-hidden pt-4 w-full">
                            <div
                                className="flex items-end min-h-[2.5rem] sm:min-h-[3rem]"
                                style={{
                                    transform: `translateX(-${activeIndex * (itemWidthMobile || 0)}px)`,
                                    transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)",
                                    willChange: "transform",
                                }}
                            >
                                {MILESTONES.map((m, i) => {
                                    const isActive = i === activeIndex;
                                    return (
                                        <button
                                            key={m.year}
                                            onClick={() => {
                                                setIsPlaying(false);
                                                setActiveIndex(i);
                                            }}
                                            style={{
                                                width: itemWidthMobile || undefined,
                                                flex: itemWidthMobile ? "none" : "0 0 50%",
                                            }}
                                            className="shrink-0 flex flex-col items-start justify-end text-left focus:outline-none cursor-pointer"
                                        >
                                            <span
                                                className={`leading-none text-2xl sm:text-3xl md:text-4xl origin-bottom-left will-change-transform ${isActive ? "text-[#FFB54E] font-bold" : "text-white/70"
                                                    }`}
                                                style={{
                                                    transform: isActive ? "scale(1.6)" : "scale(1)",
                                                    transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1), color 1s ease",
                                                    transformOrigin: "bottom left",
                                                }}
                                            >
                                                {m.year}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative mt-3 w-full border-b border-white">
                            <div className="overflow-hidden h-3">
                                <div
                                    className="flex h-full"
                                    style={{
                                        transform: `translateX(-${activeIndex * (itemWidthMobile || 0)}px)`,
                                        transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)",
                                        willChange: "transform",
                                    }}
                                >
                                    {MILESTONES.map((m) => (
                                        <div
                                            key={m.year}
                                            style={{
                                                width: itemWidthMobile || undefined,
                                                flex: itemWidthMobile ? "none" : "0 0 50%",
                                            }}
                                            className="shrink-0 flex justify-start items-end"
                                        >
                                            <div className="w-px h-3 bg-white" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-center mb-4 sm:mb-5">
                        <h1 className="animated-text text-3xl sm:text-4xl md:text-5xl font-semibold text-[#9BE7FF] text-center">
                            {t("milestone.milestones")}
                        </h1>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 sm:gap-5 w-full">
                        <div ref={mobileContentRef} className="w-full min-h-[130px] sm:min-h-[160px] flex flex-col justify-center bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="space-y-3 text-start">
                                {active.events.map((event, j) => (
                                    <div key={j}>
                                        <p className="text-white text-base sm:text-lg font-semibold">
                                            {event.date}
                                        </p>
                                        <p className="text-white/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                            {event.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-5 mt-1">
                            <button
                                onClick={goPrev}
                                disabled={activeIndex === 0}
                                className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white text-white disabled:opacity-20 transition-all hover:bg-white/10 cursor-pointer active:scale-95 text-2xl"
                                aria-label="Previous milestone"
                            >
                                <MdKeyboardArrowLeft className="text-2xl sm:text-3xl" />
                            </button>

                            <button
                                onClick={goNext}
                                disabled={activeIndex === total - 1}
                                className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white text-white disabled:opacity-20 transition-all hover:bg-white/10 cursor-pointer active:scale-95 text-2xl"
                                aria-label="Next milestone"
                            >
                                <MdKeyboardArrowRight className="text-2xl sm:text-3xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}