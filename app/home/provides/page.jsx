"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fredoka } from "../../../public/fonts/fonts";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useDeferredScrollAnimation } from "@/app/components/common/useDeferredScrollAnimation";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const NAVBAR_HEIGHT = 60;

export default function Provides() {
    const { t } = useLanguage();

    const DOMAINS = useMemo(() => [
        {
            id: "mobile-app",
            mainTitle: t("provides.mobile_app_title"),
            desc: t("provides.mobile_app_desc"),
            points: t("provides.mobile_app_points"),
            img: "mobile-application",
        },
        {
            id: "enterprise-cloud",
            mainTitle: t("provides.sap_title"),
            desc: t("provides.sap_desc"),
            points: t("provides.sap_points"),
            img: "SAP",
        },
        {
            id: "data-analytics",
            mainTitle: t("provides.cloud_title"),
            desc: t("provides.cloud_desc"),
            points: t("provides.cloud_points"),
            img: "cloud-mobility",
        }
    ], [t]);

    const [mobileIndex, setMobileIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(1);
    const cardsToShowRef = useRef(1);

    const mobileTrackRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const outerRef = useRef(null);
    const bgRef = useRef(null);
    const subtitleRef = useRef(null);
    const wrapRef = useRef(null);
    const navMaskRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            const nextCardsToShow = window.innerWidth >= 768 ? 2 : 1;
            if (nextCardsToShow !== cardsToShowRef.current) {
                cardsToShowRef.current = nextCardsToShow;
                setCardsToShow(nextCardsToShow);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const maxIndex = Math.max(0, DOMAINS.length - cardsToShow);

    if (mobileIndex > maxIndex) {
        setMobileIndex(maxIndex);
    }

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

    useEffect(() => {
        if (mobileTrackRef.current) {
            const shiftPercent = (100 / cardsToShow) * mobileIndex;
            gsap.to(mobileTrackRef.current, {
                xPercent: -shiftPercent,
                duration: 0.6,
                ease: "power3.out",
                force3D: true,
                overwrite: "auto"
            });
        }
    }, [mobileIndex, cardsToShow]);

    useDeferredScrollAnimation(() => {
        if (!wrapRef.current || !outerRef.current) return;

        const mm = gsap.matchMedia();

        const createProvidesTimeline = (endW, endH, startW, startH) => {
            gsap.fromTo(
                outerRef.current,
                { clipPath: "inset(15% 0% 0% 0% round 40px)" },
                {
                    clipPath: "inset(0% 0% 0% 0% round 0px)",
                    ease: "none",
                    scrollTrigger: {
                        trigger: outerRef.current,
                        start: "top bottom",
                        end: "top top",
                        scrub: true,
                    },
                }
            );

            gsap.set(subtitleRef.current, { scale: 0.3, opacity: 0.3, y: 0 });
            gsap.fromTo(
                subtitleRef.current,
                { scale: 0.1, opacity: 1 },
                {
                    scale: 1.1,
                    opacity: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: outerRef.current,
                        start: "top bottom",
                        end: "top top",
                        scrub: true,
                    },
                }
            );

            const cards = wrapRef.current.querySelectorAll(".domain-card");
            const ENTER_DURATION = 1.0;
            const HOLD_DURATION = 0.6;
            const EXIT_DURATION = 1.0;
            const LAST_CARD_HOLD_DURATION = 0.2;
            const CARD_STEP = ENTER_DURATION + HOLD_DURATION;
            const lastStart = (cards.length - 1) * CARD_STEP;
            const totalDuration = lastStart + ENTER_DURATION + LAST_CARD_HOLD_DURATION;
            const PX_PER_UNIT = window.innerHeight * 0.6;

            const startY = "100vh";
            const endY = "-100vh";

            const snapPoints = Array.from(cards).map((_, i) => {
                const startTime = i * CARD_STEP;
                const holdMid = i === cards.length - 1
                    ? startTime + ENTER_DURATION + LAST_CARD_HOLD_DURATION / 2
                    : startTime + ENTER_DURATION + HOLD_DURATION / 2;
                return holdMid / totalDuration;
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: outerRef.current,
                    start: "top top",
                    end: () => `+=${totalDuration * PX_PER_UNIT}`,
                    scrub: 1,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                    snap: {
                        snapTo: snapPoints,
                        duration: { min: 0.2, max: 0.8 },
                        delay: 0.1,
                        ease: "power1.inOut"
                    },
                    invalidateOnRefresh: true,
                    onEnter: () => gsap.to(navMaskRef.current, { opacity: 1, duration: 0.2 }),
                    onLeave: () => gsap.to(navMaskRef.current, { opacity: 0, duration: 0.2 }),
                    onEnterBack: () => gsap.to(navMaskRef.current, { opacity: 1, duration: 0.2 }),
                    onLeaveBack: () => gsap.to(navMaskRef.current, { opacity: 0, duration: 0.2 }),
                },
            });

            cards.forEach((card, i) => {
                const cardWrapper = card.querySelector(".card-wrapper");
                const imgContainer = card.querySelector(".img-container");
                const leftText = card.querySelector(".left-text");
                const rightText = card.querySelector(".right-text");

                gsap.set(imgContainer, {
                    width: endW,
                    height: endH,
                    transformOrigin: "center center",
                    force3D: true,
                });
                gsap.set(cardWrapper, { transformOrigin: "center center", force3D: true });
                gsap.set(card, { zIndex: i + 10 });

                const startTime = i * CARD_STEP;
                const startScale = Math.min(startW / endW, startH / endH);

                // Card entrance animation
                tl.fromTo(
                    cardWrapper,
                    { y: startY, scale: startScale },
                    { y: 0, scale: 1, duration: ENTER_DURATION, ease: "none" },
                    startTime
                );
                tl.fromTo(
                    leftText,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: ENTER_DURATION * 0.8, ease: "none" },
                    startTime + (ENTER_DURATION * 0.2)
                );
                tl.fromTo(
                    rightText,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: ENTER_DURATION * 0.8, ease: "none" },
                    startTime + (ENTER_DURATION * 0.2)
                );

                const holdEndTime = startTime + ENTER_DURATION + HOLD_DURATION;

                // Card exit animation
                if (i !== cards.length - 1) {
                    tl.to(
                        cardWrapper,
                        { y: endY, scale: startScale, duration: EXIT_DURATION, ease: "none" },
                        holdEndTime
                    );
                    tl.to(
                        [leftText, rightText],
                        { opacity: 0, y: -30, duration: EXIT_DURATION * 0.5, ease: "none" },
                        holdEndTime
                    );
                }
            });

            // Hold final card before proceeding to next section
            tl.to({}, { duration: LAST_CARD_HOLD_DURATION }, lastStart + ENTER_DURATION);
        };

        // Full Desktop (100% scale on 1080p, >= 1750px)
        mm.add("(min-width: 1750px)", () => {
            createProvidesTimeline(680, 560, 340, 280);
        });

        // Medium/Large Desktop (125% scale on 1080p: ~1367px - 1749px)
        mm.add("(min-width: 1367px) and (max-width: 1749px)", () => {
            createProvidesTimeline(560, 460, 280, 220);
        });

        // Standard Laptop / 150% scale on 1080p: 1024px - 1366px
        // EXACT values preserved to keep 150% scale unaffected
        mm.add("(min-width: 1024px) and (max-width: 1366px)", () => {
            createProvidesTimeline(440, 360, 220, 165);
        });

        mm.add("(max-width: 1023px)", () => {
            const mobileSec = outerRef.current?.querySelector(".mobile-provides-section");
            if (mobileSec) {
                gsap.fromTo(mobileSec,
                    { x: 50, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: mobileSec, start: "top 85%" } }
                );
            }
        });

        return () => mm.revert();
    }, []);

    return (
        <div className={`relative z-[998] w-full ${fredoka.variable}`}>
            <div data-navbar="light" className="mobile-provides-section block lg:hidden w-full bg-[#34CBEA] text-white py-14 px-0 relative overflow-hidden">
                <div className="w-full flex justify-center mb-8 px-5">
                    <h2 className="uppercase leading-none tracking-tight text-3xl sm:text-5xl text-white text-center font-extrabold" style={{ fontFamily: '"Inter", sans-serif' }}>
                        {t("provides.core_services")}
                    </h2>
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
                        {DOMAINS.map((domain) => (
                            <div key={domain.id} className="w-full md:w-1/2 flex-shrink-0 px-4 sm:px-6 md:px-4 flex flex-col items-center">
                                <div className="relative w-full aspect-square sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl mb-6 bg-black/10">
                                    <Image quality={100}
                                        src={`/FS-images/${domain.img}.jpg`}
                                        alt={domain.mainTitle}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 500px"
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                                </div>

                                <div className="w-full px-4 flex flex-col space-y-4 text-left">
                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight whitespace-pre-line">
                                        {domain.mainTitle}
                                    </h3>
                                    <p className="hero-desc-style2 text-white/95">
                                        {domain.desc}
                                    </p>
                                    <div className="pt-2">
                                        <Link href="/we-do">
                                            <button className="flex items-center gap-2 text-black bg-white py-2.5 px-6 rounded-full font-semibold text-sm shadow-md active:scale-95 transition-transform hover:bg-gray-50 cursor-pointer">
                                                {t("provides.more_services")} <span>&#8594;</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center space-x-2 mt-8 w-full z-20">
                        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setMobileIndex(idx)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${mobileIndex === idx ? "w-8 bg-white" : "w-2.5 bg-white/40"
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="hidden lg:block w-full lg:-mt-[100vh]">
                <div
                    ref={outerRef}
                    data-navbar="light"
                    className="relative w-full lg:h-[100vh] font-sans overflow-hidden"
                >
                    <div
                        ref={bgRef}
                        className="relative w-full h-full overflow-hidden flex flex-col items-center justify-start lg:justify-center bg-white lg:bg-[#34CBEA] pt-24 pb-20 lg:py-0"
                    >
                        <div className="relative z-10 w-full flex flex-col items-center justify-start lg:absolute lg:top-[12%] xl:top-[16%] 2xl:top-[18%] lg:left-0 lg:right-0 pointer-events-none">
                            <h2
                                ref={subtitleRef}
                                className="uppercase leading-[0.9] tracking-tight text-[clamp(2.2rem,4.5vw,5.5rem)] text-[#34CBEA] lg:text-white text-center font-bold"
                            >
                                {t("provides.core_services")}
                            </h2>
                        </div>

                        <div ref={wrapRef} className="relative lg:absolute lg:inset-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 mt-20 lg:mt-2x0 w-full max-w-[92vw] xl:max-w-[1160px] 2xl:max-w-[1350px] mx-auto">
                            {DOMAINS.map((domain) => (
                                <div key={domain.id} className="domain-card relative lg:absolute lg:inset-0 flex flex-col lg:flex-row lg:items-center lg:justify-center pointer-events-auto lg:pointer-events-none w-full">
                                    <h3 className="lg:hidden text-2xl md:text-3xl font-bold text-[#34CBEA] mb-4 whitespace-pre-line">
                                        {domain.mainTitle}
                                    </h3>

                                    <div className="card-wrapper relative w-full mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between xl:justify-center gap-6 lg:gap-8 xl:gap-10 2xl:gap-14 lg:mt-19 xl:mt-16 2xl:mt-20 px-2 sm:px-4">
                                        {/* Left description column */}
                                        <div className="left-text hidden lg:flex flex-col justify-center self-center flex-1 w-full min-w-0 max-w-[420px] xl:max-w-[480px] 2xl:max-w-[540px] z-10 text-white opacity-0">
                                            <p className="hero-desc-style2 text-white opacity-95 text-left text-sm lg:text-[15px] xl:text-base 2xl:text-lg leading-relaxed">
                                                {domain.desc}
                                            </p>
                                        </div>

                                        {/* Center image */}
                                        <div className="img-container relative flex-shrink-0 mx-auto rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-auto shadow-xl self-center">
                                            <Image quality={100} src={`/FS-images/${domain.img}.jpg`} alt={domain.mainTitle} fill sizes="(max-width: 1024px) 100vw, (max-width: 1366px) 440px, (max-width: 1749px) 560px, 680px" className="object-cover" />
                                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.4)_0%,transparent_50%)]" />
                                        </div>

                                        <p className="hero-desc-style2 lg:hidden text-gray-600 font-semibold text-left leading-[1.3] mt-4">
                                            {domain.desc}
                                        </p>

                                        {/* Right title & action column */}
                                        <div className="right-text hidden lg:flex flex-col justify-center self-center flex-1 w-full min-w-0 max-w-[340px] xl:max-w-[400px] 2xl:max-w-[460px] z-10 text-left opacity-0 pointer-events-auto gap-4 xl:gap-5 2xl:gap-6">
                                            <h3 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-[44px] font-bold text-white leading-[1.15] whitespace-pre-line">
                                                {domain.mainTitle}
                                            </h3>
                                            <div className="flex">
                                                <Link href="/we-do">
                                                    <button className="flex items-center gap-2 text-[#1b1b1b] bg-white py-3 px-7 xl:py-3.5 xl:px-8 2xl:py-4 2xl:px-9 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 text-sm lg:text-base xl:text-lg 2xl:text-xl font-semibold shadow-md cursor-pointer hover:bg-gray-100">
                                                        {t("provides.more_services")} ➜
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    ref={navMaskRef}
                    className="fixed top-0 left-0 right-0 pointer-events-none"
                    style={{
                        height: `${NAVBAR_HEIGHT}px`,
                        zIndex: 999,
                        opacity: 0,
                    }}
                />
            </div>
        </div>
    );
}
