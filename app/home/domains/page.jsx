
"use client"
import React, { useEffect, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Button from "@/app/components/common/Button";
import { useDeferredScrollAnimation } from "@/app/components/common/useDeferredScrollAnimation";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Domains() {
    const { t } = useLanguage();

    const domains = [
        { id: "healthcare", name: t("domains.healthcare"), img: "healthcare" },
        { id: "bfsi", name: t("domains.bfsi"), img: "BFSI" },
        { id: "education", name: t("domains.education"), img: "education" },
        { id: "sports", name: t("domains.sports"), img: "sports" },
        { id: "agriculture", name: t("domains.agriculture"), img: "agriculture" },
        { id: "logistics", name: t("domains.logistics"), img: "logistics" },
    ];

    const [mobileIndex, setMobileIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(1);
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const centerTrackRef = useRef(null);
    const mobileCenterTrackRef = useRef(null);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Update card count on viewport resize
    useEffect(() => {
        const handleResize = () => {
            const nextCardsToShow = window.innerWidth >= 768 ? 2 : 1;
            setCardsToShow(nextCardsToShow);
            const nextMaxIndex = Math.max(0, domains.length - nextCardsToShow);
            setMobileIndex((prev) => Math.min(prev, nextMaxIndex));
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [domains.length]);

    const maxIndex = Math.max(0, domains.length - cardsToShow);

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
        const mobileTrack = mobileCenterTrackRef.current;
        if (mobileTrack) {
            const shiftPercent = (100 / cardsToShow) * mobileIndex;
            gsap.to(mobileTrack, {
                xPercent: -shiftPercent,
                duration: 0.6,
                ease: "power3.out",
                force3D: true,
                overwrite: "auto",
            });
        }
    }, [mobileIndex, cardsToShow]);

    // GSAP ScrollTrigger timeline for desktop center-focused domain carousel
    useDeferredScrollAnimation(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            const track = trackRef.current;
            if (!track) return;

            const centerTrack = centerTrackRef.current;
            const centerCardElem = centerTrack ? centerTrack.parentElement : null;
            const containerW = track.getBoundingClientRect().width || window.innerWidth;
            const centerCardWidth = centerCardElem ? centerCardElem.getBoundingClientRect().width : Math.min(containerW * 0.24, 490);

            const cardElements = track.children;
            const sampleCard = cardElements[0];
            const CARD_WIDTH = sampleCard ? sampleCard.getBoundingClientRect().width : 200;
            const GAP = Math.round(Math.max(20, Math.min(32, containerW * 0.015)));
            const NORMAL_STEP = CARD_WIDTH + GAP;

            const totalSteps = domains.length - 1;

            const SIDE_GAP = Math.round(Math.max(24, Math.min(42, containerW * 0.02)));
            const centerLeft = containerW / 2 - centerCardWidth / 2;
            const centerRight = containerW / 2 + centerCardWidth / 2;

            const initRightStart = centerRight + SIDE_GAP;
            const leftStart = centerLeft - SIDE_GAP - CARD_WIDTH;
            const initCenterPos = containerW / 2 - CARD_WIDTH / 2;
            const startIndex = domains.length;

            for (let i = 0; i < cardElements.length; i++) {
                let delta = i - startIndex;
                if (delta < 0) {
                    gsap.set(cardElements[i], { x: leftStart + (delta + 1) * NORMAL_STEP, opacity: 1 });
                } else if (delta === 0) {
                    gsap.set(cardElements[i], { x: initCenterPos, opacity: 0 });
                } else {
                    gsap.set(cardElements[i], { x: initRightStart + (delta - 1) * NORMAL_STEP, opacity: 1 });
                }
            }

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: () => `+=${window.innerHeight * totalSteps * 0.5}`,
                    pin: true,
                    anticipatePin: 1,
                    scrub: true,
                    snap: {
                        snapTo: "labels",
                        duration: { min: 0.2, max: 0.4 },
                        delay: 0.05,
                        ease: "power2.out",
                    },
                },
            });

            const CENTER_STEP = centerCardElem ? centerCardElem.getBoundingClientRect().width : containerW * 0.24;

            for (let step = 0; step < totalSteps; step++) {
                const nextStep = step + 1;
                const label = `step${step}`;
                tl.add(label);

                if (centerTrack) {
                    tl.to(
                        centerTrack,
                        {
                            x: -nextStep * CENTER_STEP,
                            ease: "power3.inOut",
                            duration: 1,
                        },
                        label
                    );
                }

                const targetIndex = startIndex + nextStep;
                for (let i = 0; i < cardElements.length; i++) {
                    const card = cardElements[i];
                    let delta = i - targetIndex;
                    let targetX, targetOpacity;

                    if (delta < 0) {
                        targetX = leftStart + (delta + 1) * NORMAL_STEP;
                        targetOpacity = 1;
                    } else if (delta === 0) {
                        targetX = initCenterPos;
                        targetOpacity = 0;
                    } else {
                        targetX = initRightStart + (delta - 1) * NORMAL_STEP;
                        targetOpacity = 1;
                    }

                    tl.to(
                        card,
                        {
                            x: targetX,
                            opacity: targetOpacity,
                            ease: "power3.inOut",
                            duration: 1,
                        },
                        label
                    );
                }

                tl.to({}, { duration: 0.25 });
            }
        });

        mm.add("(max-width: 1023px)", () => {
            const mobileSec = sectionRef.current?.querySelector(".mobile-domains-section");
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
    }, []);

    return (
        <div
            id="domains-section"
            data-navbar="light"
            ref={sectionRef}
            className="relative z-30 w-full min-h-0 h-auto lg:h-screen font-sans overflow-hidden bg-[#F6FFFF] flex flex-col justify-center py-6 sm:py-8 lg:py-0"
        >
            {/* Mobile View */}
            <div className="mobile-domains-section block lg:hidden w-full py-2 sm:py-4 px-4 sm:px-8 flex flex-col items-center">
                <div className="relative flex flex-col items-center justify-center p-4 sm:p-8 z-20 text-white text-center">
                    <h2 className="text-[#34CBEA] text-3xl sm:text-5xl lg:text-[clamp(2.5rem,4.5vw,6rem)] font-bold mb-4 sm:mb-6 tracking-wide uppercase">
                        {t("domains.domains_title")}
                    </h2>
                    <p className="text-[#003154] font-bold text-sm sm:text-base md:text-lg">
                        {t("domains.domains_subtitle")}
                    </p>
                </div>

                <div className="w-full max-w-[1240px] flex flex-col items-center justify-center relative my-2">
                    <div
                        className="w-full h-[360px] sm:h-[440px] relative overflow-hidden bg-transparent"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            ref={mobileCenterTrackRef}
                            className="absolute flex h-full w-full will-change-transform"
                        >
                            {domains.map((domain, index) => (
                                <div key={domain.id || index} className="w-full md:w-1/2 h-full flex-shrink-0 relative overflow-hidden px-2">
                                    <div className="w-full h-full relative overflow-hidden rounded-tl-[clamp(30px,4vw,50px)] rounded-br-[clamp(30px,4vw,50px)] rounded-tr-none rounded-bl-none shadow-xl bg-gray-900 border border-gray-200/50">
                                        <CldImage
                                            src={domain.img}
                                            alt={domain.name}
                                            fill
                                            sizes="(max-width: 768px) 95vw, 50vw"
                                            className="object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-3">
                                            <h3 className="text-white text-[clamp(1.5rem,2.5vw,2.5rem)] font-bold uppercase tracking-wide text-center drop-shadow-md">
                                                {domain.name}
                                            </h3>
                                            <Button
                                                href="/industries"
                                                variant="outline"
                                                size="sm"
                                                className="text-white uppercase tracking-wider backdrop-blur-md"
                                            >
                                                {t("domains.explore")}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center space-x-2 mt-4 pb-2 z-40">
                    {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMobileIndex(idx)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${mobileIndex === idx ? "w-8 bg-[#FFB54E]" : "w-2.5 bg-black/20"
                                }`}
                            aria-label={`Go to domain ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:flex w-full h-full flex-col overflow-hidden relative">
                <div className="px-8 shrink-0 z-30 relative w-full max-w-[1800px] 2xl:max-w-[2050px] mx-auto flex flex-col items-center text-center pt-[clamp(5.3rem,7vw,8.65rem)] pb-1 gap-0 sm:gap-1">
                    <h1 className="text-[#34CBEA] text-3xl sm:text-5xl lg:text-[clamp(2.25rem,5vw,6.5rem)] font-bold tracking-wide uppercase leading-none">
                        {t("domains.domains_title")}
                    </h1>
                    <p className="text-[#003154] font-bold text-[clamp(0.95rem,1.7vw,2.2rem)] tracking-wide">
                        {t("domains.domains_subtitle")}
                    </p>
                </div>

                <section className="relative flex-1 w-full overflow-hidden">
                    <div className="relative flex h-full w-full items-center">
                        <div ref={trackRef} className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
                            {[...domains, ...domains, ...domains].map((domain, index) => (
                                <div
                                    key={`${domain.id}-${index}`}
                                    className="absolute top-[48%] xl:top-[46%] 2xl:top-[45%] -translate-y-1/2 w-[clamp(150px,12.5vw,240px)] h-[clamp(220px,38vh,390px)] overflow-hidden rounded-tl-[clamp(30px,4vw,50px)] rounded-br-[clamp(30px,4vw,50px)] rounded-tr-none rounded-bl-none will-change-transform shadow-md"
                                >
                                    <CldImage
                                        src={domain.img}
                                        alt={domain.name}
                                        fill
                                        sizes="(max-width: 1024px) 160px, (max-width: 1536px) 200px, 260px"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="absolute left-1/2 top-[48%] xl:top-[46%] 2xl:top-[45%] z-20 h-[clamp(340px,58vh,600px)] w-[clamp(270px,24vw,490px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden rounded-tl-[clamp(30px,4vw,50px)] rounded-br-[clamp(30px,4vw,50px)] rounded-tr-none rounded-bl-none shadow-2xl">
                            <div
                                ref={centerTrackRef}
                                className="absolute flex h-full will-change-transform"
                            >
                                {domains.map((domain, index) => (
                                    <div key={domain.id || index} className="w-[clamp(270px,24vw,490px)] h-full flex-shrink-0 relative overflow-hidden">
                                        <CldImage
                                            src={domain.img}
                                            alt={domain.name}
                                            fill
                                            sizes="(max-width: 1024px) 350px, (max-width: 1536px) 420px, 520px"
                                            className="object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 pt-[clamp(5rem,10vh,7.5rem)] pb-[clamp(1.5rem,2.5vh,2.5rem)] bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center gap-[clamp(0.75rem,1.2vh,1.25rem)]">
                                            <h3 className="text-white text-[clamp(1.25rem,1.8vw,2.25rem)] font-bold uppercase tracking-wide text-center drop-shadow-md">
                                                {domain.name}
                                            </h3>
                                            <Button
                                                href="/industries"
                                                variant="outline"
                                                className="px-[clamp(1.25rem,1.5vw,2.2rem)] py-[clamp(0.5rem,0.6vw,0.85rem)] text-white text-[clamp(0.85rem,1vw,1.1rem)] uppercase tracking-wider backdrop-blur-md pointer-events-auto shadow-lg"
                                            >
                                                {t("domains.explore")}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="absolute left-1/2 top-[48%] xl:top-[46%] 2xl:top-[45%] z-30 h-[clamp(340px,58vh,600px)] w-[clamp(270px,24vw,490px)] -translate-x-1/2 -translate-y-1/2 border border-white/20 rounded-tl-[clamp(30px,4vw,50px)] rounded-br-[clamp(30px,4vw,50px)] pointer-events-none" />
                    </div>
                </section>
            </div>
        </div>
    );
} 