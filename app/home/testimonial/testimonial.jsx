"use client";

import React, { useRef, useState, useEffect, useCallback, forwardRef } from "react";
import Image from "next/image";
import HTMLFlipBook from "react-pageflip";
import { MdOutlineKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const Page = forwardRef(({ children, className = "", ...props }, ref) => {
    return (
        <div ref={ref} className={`page w-full h-full ${className}`} {...props}>
            {children}
        </div>
    );
});
Page.displayName = "Page";

const clamp = (min, val, max) => Math.min(Math.max(val, min), max);

function getFluidDimensions(vw, vh) {
    if (vw < 1024) {
        return {
            width: Math.min(vw - 40, 400),
            height: 450,
            isPortrait: true,
        };
    }

    const width = clamp(350, vw * 0.25, vw >= 7680 ? 2000 : vw >= 3840 ? 1200 : vw >= 2560 ? 800 : vw >= 1920 ? 600 : 450);
    const height = clamp(450, vh * 0.65, vh >= 2160 ? 1400 : vh >= 1440 ? 1000 : vh >= 1080 ? 750 : 550);

    return { width, height, isPortrait: false };
}

export default function Testimonial() {
    const { t } = useLanguage();

    const testimonials = [1, 2, 3, 4].map((id) => ({
        name: t(`testimonials.item${id}_name`),
        designation: t(`testimonials.item${id}_designation`),
        review: t(`testimonials.item${id}_review`),
        rating: id === 4 ? 4 : 5,
    }));

    const bookRef = useRef(null);
    const containerRef = useRef(null);
    const mobileTrackRef = useRef(null);

    const [mobileIndex, setMobileIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(1);
    const [dimensions, setDimensions] = useState({ width: 450, height: 600, isPortrait: false });
    const [pageIndex, setPageIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Responsive card count calculation
    useEffect(() => {
        const handleResize = () => {
            setCardsToShow(window.innerWidth >= 768 ? 2 : 1);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const maxIndex = Math.max(0, testimonials.length - cardsToShow);

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

    // Mobile entrance slide-in animation
    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add("(max-width: 1023px)", () => {
            const mobileSec = containerRef.current?.querySelector(".mobile-testimonial-section");
            if (mobileSec) {
                gsap.fromTo(
                    mobileSec,
                    { x: 50, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: "power2.out",
                        scrollTrigger: { trigger: mobileSec, start: "top 85%" },
                    }
                );
            }
        });
        return () => mm.revert();
    }, { scope: containerRef });

    // Animate mobile track translation
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

    // FlipBook dimensions updater
    useEffect(() => {
        const updateSize = () => {
            const { width, height, isPortrait } = getFluidDimensions(window.innerWidth, window.innerHeight);
            setDimensions({ width, height, isPortrait });
        };

        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const handlePrev = useCallback(() => {
        bookRef.current?.pageFlip()?.flipPrev();
    }, []);

    const handleNext = useCallback(() => {
        bookRef.current?.pageFlip()?.flipNext();
    }, []);

    const onFlip = useCallback((e) => {
        setPageIndex(e.data);
    }, []);

    const onInit = useCallback(() => {
        setTotalPages(bookRef.current?.pageFlip()?.getPageCount() ?? 0);
    }, []);

    return (
        <section
            id="testimonial-section"
            ref={containerRef}
            data-navbar="light"
            className="isolate relative z-50 w-full min-h-0 lg:h-screen bg-[#F8F9FA] flex flex-col justify-center overflow-hidden py-4 sm:py-6 lg:py-16 px-0"
        >
            {/* Mobile / Tablet View */}
            <div className="mobile-testimonial-section block lg:hidden w-full bg-[#F8F9FA] text-black py-4 sm:py-6 px-0 relative overflow-hidden">
                <div className="w-full flex flex-col items-center text-center mb-5 sm:mb-6 px-5">
                    <div className="inline-flex items-center bg-white border border-gray-200 rounded-full pr-4 p-1 mb-4 shadow-xs">
                        <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mr-3">
                            {testimonials.length}
                        </span>
                        <span className="text-xs font-bold tracking-widest text-gray-800 uppercase">
                            {t("testimonials.testimonials")}
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold uppercase leading-tight tracking-tight">
                        <span className="text-[#003154]">{t("testimonials.stories_from")}</span>{" "}
                        <span className="text-[#34cbea]">{t("testimonials.clients")}</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-[clamp(11px,1.1vw,18px)] mt-2">
                        {t("testimonials.happy_customers")}
                    </p>
                </div>

                <div
                    className="w-full relative overflow-hidden px-2 sm:px-6 md:px-10 max-w-5xl mx-auto"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        ref={mobileTrackRef}
                        className="flex w-full will-change-transform"
                    >
                        {testimonials.map((item, idx) => (
                            <div key={idx} className="w-full md:w-1/2 flex-shrink-0 px-3 sm:px-5 md:px-4 flex flex-col items-center">
                                <div className="w-full h-full bg-white p-5 sm:p-7 rounded-tl-[clamp(35px,4vw,50px)] rounded-br-[clamp(35px,4vw,50px)] rounded-tr-none rounded-bl-none shadow-xl border border-gray-100 flex flex-col justify-between space-y-4 sm:space-y-6 relative overflow-hidden">
                                    <div className="flex gap-1 text-[#FFB54E] text-2xl">
                                        {Array(item.rating).fill("★").map((star, i) => (
                                            <span key={i}>{star}</span>
                                        ))}
                                    </div>

                                    <p className="text-sm sm:text-base leading-relaxed text-black/80 italic flex-1 font-normal">
                                        "{item.review}"
                                    </p>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h3 className="font-bold text-black uppercase text-base tracking-wide">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-500 text-[clamp(11px,1.1vw,18px)] font-medium">
                                            {item.designation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Dots */}
                    <div className="w-full flex items-center justify-center mt-6 px-4">
                        <div className="flex space-x-2.5">
                            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMobileIndex(idx)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${mobileIndex === idx ? "w-8 bg-[#FFB54E]" : "w-2.5 bg-gray-300"
                                        }`}
                                    aria-label={`Go to testimonial ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop FlipBook View */}
            <div className="hidden lg:flex max-w-[1800px] 2xl:max-w-[2050px] w-full mx-auto flex-row items-stretch gap-12 px-6 lg:px-12 xl:px-16">
                <div className="w-1/3 flex flex-col justify-between py-10 z-10 relative transform-gpu [transform:translateZ(0)] [backface-visibility:hidden]">
                    <div className="relative">
                        <div className="inline-flex items-center bg-white border border-gray-100 rounded-full pr-4 p-1 mb-6 shadow-xs">
                            <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mr-3">
                                {testimonials.length}
                            </span>
                            <span className="text-xs 2xl:text-sm font-bold tracking-widest text-gray-800 uppercase">
                                {t("testimonials.testimonials")}
                            </span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-extrabold text-black uppercase leading-[1.1] tracking-tight">
                            <span className="text-[clamp(1.5rem,2vw,2.5rem)] text-[#003154] font-bold block mb-1">{t("testimonials.stories_from")}</span>
                            <span className="text-[#34cbea]">{t("testimonials.clients")}</span>
                        </h2>
                        <Image quality={100}
                            src="/FS-images/jmr-air-plane.svg"
                            alt=""
                            width={450}
                            height={450}
                            className="air-plane absolute right-0 w-[clamp(120px,15vw,300px)] h-auto object-contain"
                        />
                    </div>

                    <div className="mt-32 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <Image quality={100} src="/FS-images/stories1.png" alt="user" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                                <Image quality={100} src="/FS-images/stories2.png" alt="user" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                                <Image quality={100} src="/FS-images/stories3.png" alt="user" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 text-white flex items-center justify-center text-lg font-bold">+</div>
                            </div>
                            <p className="customer-count-text text-[clamp(0.85rem,1.05vw,1.25rem)] text-gray-500 leading-[1.4]">
                                {t("testimonials.happy_customers")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-2/3 relative flex items-center justify-end z-10 min-h-[500px]">
                    <HTMLFlipBook
                        ref={bookRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        size="stretch"
                        minWidth={300}
                        maxWidth={2000}
                        minHeight={400}
                        maxHeight={2000}
                        showCover={false}
                        usePortrait={dimensions.isPortrait}
                        mobileScrollSupport={true}
                        drawShadow={false}
                        flippingTime={800}
                        useMouseEvents={true}
                        swipeDistance={20}
                        clickEventForward={true}
                        onFlip={onFlip}
                        onInit={onInit}
                    >
                        {testimonials.flatMap((testimonial, index) => [
                            <Page key={`title-${index}`}>
                                <div className="w-full h-full bg-[#0f172a] flex flex-col items-center justify-center p-8 relative overflow-hidden rounded-tl-[clamp(40px,3.5vw,60px)] rounded-tr-none rounded-bl-none rounded-br-none">
                                    <div
                                        className="absolute inset-0 opacity-20"
                                        style={{
                                            backgroundImage: "radial-gradient(#fbbf24 1px, transparent 1px)",
                                            backgroundSize: "20px 20px",
                                            maskImage: "radial-gradient(circle at center, black, transparent 80%)",
                                        }}
                                    />
                                    <span className="text-gray-400 text-[200px] absolute top-0 left-10 select-none pointer-events-none opacity-40">❝</span>
                                    <div className="text-white text-center z-10">
                                        <div className="flex items-center gap-3 justify-center mb-2">
                                            <span className="w-24 h-[2px] bg-gradient-to-r from-transparent to-yellow-500" />
                                            <span className="text-4xl bg-yellow-500 w-2 h-2 rounded-full" />
                                            <span className="text-xl 2xl:text-2xl uppercase tracking-widest text-white">{t("testimonials.story")}</span>
                                            <span className="text-4xl bg-yellow-500 w-2 h-2 rounded-full" />
                                            <span className="w-24 h-[2px] bg-gradient-to-l from-transparent to-yellow-500" />
                                        </div>
                                        <div className="text-[120px] font-bold text-yellow-500 leading-none 2xl:text-[180px]">
                                            {(index + 1).toString().padStart(2, "0")}
                                        </div>
                                    </div>
                                </div>
                            </Page>,

                            <Page key={`text-${index}`}>
                                <div className="w-full h-full bg-white p-8 xl:p-10 2xl:p-14 flex flex-col justify-center relative overflow-hidden rounded-br-[clamp(40px,3.5vw,60px)] rounded-tl-none rounded-tr-none rounded-bl-none">
                                    <div className="flex gap-1.5 text-yellow-500 mb-4 xl:mb-6 text-2xl 2xl:text-4xl">
                                        {Array(testimonial.rating).fill("★").map((star, i) => (
                                            <span key={i}>{star}</span>
                                        ))}
                                    </div>
                                    <p className="text-[clamp(1.05rem,1.4vw,1.75rem)] leading-[1.65] author-review text-black/85 mb-6 font-normal">
                                        "{testimonial.review}"
                                    </p>
                                    <div>
                                        <h3 className="author-name text-[clamp(1.25rem,1.5vw,1.85rem)] font-bold uppercase text-black">
                                            {testimonial.name}
                                        </h3>
                                        <p className="author-designation text-gray-500 text-[clamp(0.875rem,1.1vw,1.25rem)] font-medium mt-1">
                                            {testimonial.designation}
                                        </p>
                                    </div>
                                </div>
                            </Page>,
                        ])}
                    </HTMLFlipBook>

                    <div className="absolute bottom-4 lg:bottom-12 left-1/2 lg:ml-12 lg:mt-5 flex items-center gap-3 z-30 transform -translate-x-1/2 lg:translate-x-0">
                        <button
                            onClick={handlePrev}
                            disabled={pageIndex === 0}
                            aria-label="Previous page"
                            className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16 rounded-full border border-gray-200 bg-white flex items-center justify-center text-black text-xl hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <MdOutlineKeyboardArrowLeft />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={pageIndex >= totalPages - (dimensions.isPortrait ? 1 : 2)}
                            aria-label="Next page"
                            className="w-10 h-10 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16 rounded-full border border-gray-200 bg-white flex items-center justify-center text-black text-xl hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <MdKeyboardArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}