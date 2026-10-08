"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Button from "@/app/components/common/Button";
import Image from "next/image";
import FloatingImages from "./FloatingImages";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const desktopVideoUrl = "https://res.cloudinary.com/npifodto/video/upload/c_limit,w_1280/f_auto:video/q_auto:eco/v1/homepage-video";
const mobileVideoUrl = "https://res.cloudinary.com/npifodto/video/upload/c_limit,w_640/f_auto:video/q_auto:eco/v1/homepage-video";
const desktopPosterUrl = "https://res.cloudinary.com/npifodto/video/upload/c_limit,w_1280/f_webp/q_auto:eco/v1/homepage-video";
const mobilePosterUrl = "https://res.cloudinary.com/npifodto/video/upload/c_limit,w_640/f_webp/q_auto:eco/v1/homepage-video";

const projectImageUrls = {
    industry_expertise: "https://res.cloudinary.com/npifodto/image/upload/c_limit,w_800/f_auto/q_auto/v1/industry_expertise",
    "proven-experience": "https://res.cloudinary.com/npifodto/image/upload/c_limit,w_800/f_auto/q_auto/v1/proven-experience",
    billingual: "https://res.cloudinary.com/npifodto/image/upload/c_limit,w_800/f_auto/q_auto/v1/billingual",
    "japanese-training": "https://res.cloudinary.com/npifodto/image/upload/c_limit,w_800/f_auto/q_auto/v1/japanese-training",
};

export default function CombinedHeroAndAbout() {
    const { t, lang } = useLanguage();
    const heroSubtitle = t("hero.subtitle");

    const projectsData = useMemo(() => [
        {
            id: 1,
            title: t("hero.project_1_title"),
            desc: t("hero.project_1_desc"),
            category: t("hero.project_1_category"),
            imgSrc: "industry_expertise",
        },
        {
            id: 2,
            title: t("hero.project_2_title"),
            desc: t("hero.project_2_desc"),
            category: t("hero.project_2_category"),
            imgSrc: "proven-experience",
        },
        {
            id: 3,
            title: t("hero.project_3_title"),
            desc: t("hero.project_3_desc"),
            category: t("hero.project_3_category"),
            imgSrc: "billingual",
        },
        {
            id: 4,
            title: t("hero.project_4_title"),
            desc: t("hero.project_4_desc"),
            category: t("hero.project_4_category"),
            imgSrc: "japanese-training",
        },
    ], [t]);

    const [mobileIndex, setMobileIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(1);

    const cardsToShowRef = useRef(1);

    const mobileTrackRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const containerRef = useRef(null);
    const videoWrapperRef = useRef(null);
    const videoRef = useRef(null);
    const mobileVideoRef = useRef(null);
    const textContainerRef = useRef(null);
    const innerWrapperRef = useRef(null);
    const horizontalTrackRef = useRef(null);
    const lastCardRef = useRef(null);
    const introTextRef = useRef(null);



    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const nextCardsToShow = width >= 768 ? 2 : 1;

            if (nextCardsToShow !== cardsToShowRef.current) {
                cardsToShowRef.current = nextCardsToShow;
                setCardsToShow(nextCardsToShow);
                const nextMaxIndex = Math.max(0, projectsData.length - nextCardsToShow);
                setMobileIndex((prev) => Math.min(prev, nextMaxIndex));
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [projectsData.length]);

    const maxIndex = Math.max(0, projectsData.length - cardsToShow);

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

    // Animate mobile cards track on swipe or index change (skip initial mount)
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

    // Desktop GSAP pinned scroll timeline and animation sequence
    useGSAP(
        () => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) return;
            if (!containerRef.current || !videoWrapperRef.current || !textContainerRef.current) return;

            const mm = gsap.matchMedia();

            mm.add("(min-width: 1024px)", () => {
                const W = window.innerWidth;
                const H = window.innerHeight;
                const scrollDist = Math.max(4800, H * 6);
                const insetX = (W - 200) / 2;
                const insetY = (H - 200) / 2;

                // Pre-measure geometry BEFORE DOM mutations to eliminate forced reflows
                let moveLeftDist = 0;
                if (lastCardRef.current) {
                    const lastCardRight = lastCardRef.current.offsetLeft + lastCardRef.current.offsetWidth;
                    moveLeftDist = -(lastCardRight - W * 0.92);
                } else if (horizontalTrackRef.current) {
                    const trackWidth = horizontalTrackRef.current.scrollWidth;
                    moveLeftDist = -(trackWidth - W);
                }

                const cards = gsap.utils.toArray(".project-card");
                const totalCards = cards.length;
                const totalTravel = Math.abs(moveLeftDist) || 1;

                const introRight = introTextRef.current
                    ? introTextRef.current.getBoundingClientRect().right
                    : W * 0.60;

                const FADE_PRE_PX = 60;
                const FADE_POST_PX = 80;

                const cardFadeWindows = cards.map((card, i) => {
                    if (i === totalCards - 1) return null;
                    const cardLeft = card.getBoundingClientRect().left;
                    const pCollide = (cardLeft - introRight) / totalTravel;
                    const pStart = Math.max(0, pCollide - FADE_PRE_PX / totalTravel);
                    const pEnd = Math.max(0, pCollide + FADE_POST_PX / totalTravel);
                    return { pStart, pEnd };
                });

                // Video wrapper: full-screen dark bg + video
                gsap.set(videoWrapperRef.current, {
                    width: W,
                    height: H,
                    clipPath: "inset(0px 0px 0px 0px round 0px)",
                    opacity: 1,
                    autoAlpha: 1,
                    scale: 1,
                });

                gsap.set(textContainerRef.current, {
                    opacity: 0,
                    autoAlpha: 0,
                    width: W,
                    height: H,
                    top: "50%",
                    left: "50%",
                    xPercent: -50,
                    yPercent: -50,
                });

                gsap.set(innerWrapperRef.current, { scale: 1 });
                gsap.set(".next-char", { opacity: 0 });
                gsap.set(".final-subtitle", { opacity: 0, y: 15 });
                gsap.set("#projects-wrapper", { zIndex: 20, autoAlpha: 0 });
                gsap.set(introTextRef.current, { x: 120, opacity: 0 });
                gsap.set(".project-card", { opacity: 0, x: 100 });

                containerRef.current.setAttribute("data-navbar", "dark");

                const navProxy = { opacity: 0, r: 255, g: 255, b: 255 };
                const nav = document.getElementById("main-navbar");

                const clearNavStyles = () => {
                    const targetNav = nav || document.getElementById("main-navbar");
                    if (targetNav) {
                        targetNav.style.removeProperty("--nav-bg-opacity");
                        targetNav.style.removeProperty("--nav-color");
                    }
                };

                const applyNavStyles = () => {
                    const targetNav = nav || document.getElementById("main-navbar");
                    if (!targetNav) return;
                    if (tl.scrollTrigger && !tl.scrollTrigger.isActive) {
                        clearNavStyles();
                        return;
                    }
                    targetNav.style.setProperty("--nav-bg-opacity", navProxy.opacity);
                    targetNav.style.setProperty(
                        "--nav-color",
                        `rgb(${Math.round(navProxy.r)}, ${Math.round(navProxy.g)}, ${Math.round(navProxy.b)})`
                    );
                };

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: `+=${scrollDist}`,
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onEnter: applyNavStyles,
                        onEnterBack: applyNavStyles,
                        onLeave: clearNavStyles,
                        onLeaveBack: clearNavStyles,
                        onRefresh: (self) => {
                            if (!self.isActive) clearNavStyles();
                        },
                        onToggle: (self) => {
                            if (!self.isActive) clearNavStyles();
                        },
                    },
                });

                // Apply initial navbar styles if in hero view without forced reflow
                if (window.scrollY < 80) {
                    applyNavStyles();
                } else {
                    clearNavStyles();
                }

                // Pinned hero-to-about timeline sequence
                tl.to(".hero-line-1", { y: -H * 0.9, opacity: 0, ease: "power1.inOut", duration: 0.6 }, 0);
                tl.fromTo(
                    ".hero-subtitle",
                    { autoAlpha: 0, y: 40 },
                    { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
                    0.1
                );

                // Second text (hero-subtitle) fades out at 0.8
                tl.to(".hero-subtitle", { autoAlpha: 0, ease: "power1.inOut", duration: 0.7 }, 0.8);



                // Step 2: Wrapper (now just dark bg, no video) starts shrinking via clipPath
                tl.to(
                    videoWrapperRef.current,
                    {
                        clipPath: `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round 20px)`,
                        ease: "power1.inOut",
                        duration: 1.0,
                    },
                    1.5
                );

                // Animate background color of the main container to white before the video shrinks
                tl.to(
                    containerRef.current,
                    {
                        backgroundColor: "#FFFFFF",
                        ease: "power1.inOut",
                        duration: 0.5,
                    },
                    1.2
                );

                // Step 3: Wrapper scales to 0 and disappears
                tl.to(
                    videoWrapperRef.current,
                    { opacity: 0, scale: 0, ease: "power2.inOut", duration: 0.8 },
                    2.0
                );

                // Navbar: transitions from white (dark bg) → black (light bg revealed) as overlay shrinks
                tl.to(
                    navProxy,
                    {
                        opacity: 1,
                        r: 0,
                        g: 0,
                        b: 0,
                        duration: 1.0,
                        ease: "power1.inOut",
                        onUpdate: applyNavStyles,
                    },
                    1.8
                );

                tl.to(
                    textContainerRef.current,
                    {
                        autoAlpha: 1,
                        ease: "power2.out",
                        duration: 0.8,
                    },
                    2.1
                );

                // Fade in floating images
                tl.to(
                    ".floating-images-wrapper",
                    {
                        autoAlpha: 1,
                        ease: "power2.out",
                        duration: 0.8,
                    },
                    2.1
                );

                // Parallax motion for floating images
                tl.to(".floating-img-up", { y: -200, ease: "none", duration: 1.8 }, 2.1);
                tl.to(".floating-img-down", { y: 200, ease: "none", duration: 1.8 }, 2.1);

                tl.to(".next-char", { opacity: 1, stagger: 0.01, duration: 0.5, ease: "power2.out" }, 2.3);
                tl.to(".final-subtitle", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 2.6);

                tl.to(
                    textContainerRef.current,
                    {
                        autoAlpha: 0,
                        duration: 0.7,
                        ease: "power2.inOut",
                    },
                    3.9
                );

                // Fade out floating images
                tl.to(
                    ".floating-images-wrapper",
                    {
                        autoAlpha: 0,
                        duration: 0.7,
                        ease: "power2.inOut",
                    },
                    3.9
                );

                tl.to(
                    navProxy,
                    {
                        opacity: 0,
                        r: 255,
                        g: 255,
                        b: 255,
                        duration: 0.6,
                        ease: "power1.inOut",
                        onUpdate: applyNavStyles,
                    },
                    "<"
                );

                tl.to("#projects-wrapper", { zIndex: 45, autoAlpha: 1, duration: 0.1 }, ">");
                tl.to(".project-bg-0", { opacity: 0.45, duration: 0.5, ease: "power2.out" }, "<");

                tl.to(
                    introTextRef.current,
                    {
                        x: 0,
                        opacity: 1,
                        duration: 0.6,
                        ease: "power2.out",
                    },
                    "<"
                );

                tl.to(
                    ".project-card",
                    {
                        opacity: 1,
                        x: 0,
                        stagger: 0.12,
                        duration: 0.5,
                        ease: "power3.out",
                    },
                    "<"
                );

                tl.addLabel("startScroll");

                const lastOp = new Float32Array(totalCards).fill(-1);

                tl.to(
                    horizontalTrackRef.current,
                    {
                        x: moveLeftDist,
                        ease: "none",
                        duration: 3,
                        onUpdate: function () {
                            const rawProgress = this.progress();
                            for (let i = 0; i < totalCards - 1; i++) {
                                const win = cardFadeWindows[i];
                                if (!win) continue;
                                let op;
                                if (rawProgress <= win.pStart) {
                                    op = 1;
                                } else if (rawProgress >= win.pEnd) {
                                    op = 0;
                                } else {
                                    op = 1 - (rawProgress - win.pStart) / (win.pEnd - win.pStart);
                                }
                                const rounded = Math.round(Math.max(0, Math.min(1, op)) * 1000) / 1000;
                                if (lastOp[i] !== rounded) {
                                    lastOp[i] = rounded;
                                    cards[i].style.opacity = rounded;
                                }
                            }
                        },
                    },
                    "startScroll"
                );

                tl.to(".project-bg-0", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "startScroll+=0.9");
                tl.to(".project-bg-1", { opacity: 0.45, duration: 0.5, ease: "power2.inOut" }, "startScroll+=0.9");
                tl.to(".project-bg-1", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "startScroll+=1.8");
                tl.to(".project-bg-2", { opacity: 0.45, duration: 0.5, ease: "power2.inOut" }, "startScroll+=1.8");
                tl.to(".project-bg-2", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "startScroll+=2.7");
                tl.to(".project-bg-3", { opacity: 0.45, duration: 0.5, ease: "power2.inOut" }, "startScroll+=2.7");

                tl.to({}, { duration: 1.5 });
            });

            mm.add("(max-width: 1023px)", () => {
                // Mobile layout is styled via standard responsive CSS; no forced reflows on desktop tree
            });

            return () => {
                const nav = document.getElementById("main-navbar");
                if (nav) {
                    nav.style.removeProperty("--nav-bg-opacity");
                    nav.style.removeProperty("--nav-color");
                }
                mm.revert();
            };
        },
        { scope: containerRef }
    );

    const isFirstLangRef = useRef(true);
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isFirstLangRef.current) {
            isFirstLangRef.current = false;
            return;
        }
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 300);
        return () => clearTimeout(timer);
    }, [lang]);

    return (
        <>
            {/* Desktop View */}
            <div data-navbar="dark" ref={containerRef} className="hidden lg:block relative w-full h-screen overflow-hidden select-none bg-[#071036] text-white will-change-[background-color]">
                {/* Dark overlay + video: starts full screen so Hero is visible on first frame */}
                <div
                    ref={videoWrapperRef}
                    className="absolute inset-0 z-[30] w-full h-full overflow-hidden flex items-center justify-center will-change-[clip-path,opacity,transform] bg-[#071036]"
                >
                    <div className="absolute inset-0 bg-[#004455]/50 z-10 pointer-events-none" />
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-80 pointer-events-none"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={desktopPosterUrl}
                        onLoadedData={(e) => {
                            e.currentTarget.style.opacity = "1";
                        }}
                    >
                        <source src={desktopVideoUrl} />
                    </video>
                </div>

                <FloatingImages />

                <div className="absolute inset-0 z-[35] flex flex-col items-center justify-center w-full px-[clamp(2rem,6vw,6rem)] pointer-events-none">
                    <h1
                        className="text-white text-center font-extrabold leading-[1.1] tracking-tight flex flex-col"
                        style={{ fontSize: "clamp(3rem,6.4vw,10rem)", fontFamily: '"Inter",sans-serif', textShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}
                    >
                        <span className="hero-line-1 block will-change-transform">{t("hero.turning_vision")}</span>
                    </h1>
                    <div className="hero-subtitle absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-auto invisible opacity-0 w-full">
                        <div className="w-full max-w-[96vw] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-[85vw] mx-auto flex flex-col items-center justify-center text-center">
                            <h2 className="hero-heading-title text-white drop-shadow-md mb-3 sm:mb-4 lg:mb-5 2xl:mb-6 text-center">
                                {t("hero.subtitle_title")}
                            </h2>
                            <p className="hero-desc-style text-white/95 text-center drop-shadow-sm mb-5 sm:mb-6 2xl:mb-8 max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
                                {heroSubtitle}
                            </p>
                            <div className="flex justify-center">
                                <Button
                                    href="/we-do"
                                    className="text-sm sm:text-base 2xl:text-xl py-2.5 px-6 sm:py-3 sm:px-8 2xl:py-4 2xl:px-10 shadow-md"
                                >
                                    {t("hero.explore_services")} <span>➜</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    ref={textContainerRef}
                    className="absolute z-40 pointer-events-none overflow-visible flex items-center justify-center opacity-0 invisible"
                    style={{
                        filter: "blur(0px)",
                        WebkitFilter: "blur(0px)",
                        opacity: 0,
                        visibility: "hidden",
                    }}
                >
                    <div
                        ref={innerWrapperRef}
                        className="flex flex-col items-center justify-center text-center p-2 sm:p-3 will-change-transform"
                        style={{ width: "max-content", transform: "translateZ(0)" }}
                    >
                        <h1
                            className="hero-heading-title final-heading text-black text-center"
                            style={{
                                whiteSpace: "nowrap",
                            }}
                        >
                            <div className="sentence flex items-center justify-center gap-[0.2em] flex-nowrap whitespace-nowrap">
                                <span className="big-word inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                                    {t("hero.trusted_by").split("").map((char, i) => (
                                        <span key={`n1${i}`} className="next-char inline-block" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                            {char}
                                        </span>
                                    ))}
                                </span>
                                <span className="big-word font-bold inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                                    {t("hero.businesses").split("").map((char, i) => (
                                        <span key={`b1${i}`} className="next-char inline-block" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                            {char}
                                        </span>
                                    ))}
                                </span>
                            </div>
                            <div className="sentence flex items-center justify-center gap-[0.2em] flex-nowrap whitespace-nowrap">
                                <span className="big-word inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                                    {t("hero.technology").split("").map((char, i) => (
                                        <span key={`t1${i}`} className="next-char inline-block" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                            {char}
                                        </span>
                                    ))}
                                </span>
                                <span className="big-word inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                                    {t("hero.driven_by").split("").map((char, i) => (
                                        <span key={`n2${i}`} className="next-char inline-block" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                            {char}
                                        </span>
                                    ))}
                                </span>
                                <span className="big-word font-bold inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                                    {t("hero.innovation").split("").map((char, i) => (
                                        <span key={`b2${i}`} className="next-char inline-block" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                            {char}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        </h1>
                        <p
                            className="hero-desc-style final-subtitle mt-3 sm:mt-4 lg:mt-5 text-black/90 text-center mx-auto max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl will-change-[opacity,transform]"
                        >
                            {t("hero.about_desc")}
                        </p>
                    </div>
                </div>

                <div
                    id="projects-wrapper"
                    className="absolute inset-0 z-[20] overflow-hidden flex items-center bg-[#071036] opacity-0 pointer-events-none"
                >
                    {/* Project background images */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {projectsData.map((project, index) => (
                            <div
                                key={`bg-${index}`}
                                className={`project-bg-${index} absolute inset-0 opacity-0 pointer-events-none`}
                            >
                                <Image
                                    src={projectImageUrls[project.imgSrc] || project.imgSrc}
                                    alt=""
                                    fill
                                    unoptimized
                                    sizes="(max-width: 1280px) 50vw, 33vw"
                                    loading="lazy"
                                    className="object-cover object-center"
                                />

                                <div className="absolute inset-0 bg-black/50 z-10" />
                            </div>
                        ))}
                    </div>

                    <div
                        ref={introTextRef}
                        className="intro-text-fixed absolute left-[clamp(1.5rem,3.5vw,3.5rem)] top-1/2 -translate-y-1/2 z-10 w-[clamp(55%,58vw,880px)] text-white font-medium drop-shadow-md will-change-transform mt-10 opacity-0"
                        style={{ opacity: 0 }}
                    >
                        <h1 className="text-[clamp(2.25rem,4vw,5rem)] leading-[1.15] font-bold pb-[clamp(0.75rem,2vw,1.6rem)] text-start text-[#fff]">
                            {lang === "en" ? (
                                <>
                                    {t("hero.why_choose")} <span className="text-[#34CBEA] text-[clamp(2.75rem,5.5vw,6.5rem)] fuji-text">{t("about.fujisakura")}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-[#34CBEA] text-[clamp(1.8rem,4vw,5rem)] fuji-text">{t("about.fujisakura")}</span>{t("hero.why_choose")}
                                </>
                            )}
                        </h1>
                        <p className="text-[clamp(1rem,1.6vw,1.8rem)] text-white max-w-[95%] pb-[clamp(0.75rem,2vw,1rem)]">
                            {t("hero.why_choose_desc")}
                        </p>
                        <p className="text-[clamp(1rem,1.6vw,1.8rem)] text-white max-w-[95%] pb-[clamp(0.75rem,2vw,1rem)]">
                            {t("hero.why_choose_desc1")}
                        </p>
                    </div>

                    <div
                        ref={horizontalTrackRef}
                        className="flex flex-row items-center h-full pl-[clamp(850px,72vw,1180px)] gap-[clamp(200px,20vw,360px)] py-10 md:py-14 will-change-transform mt-10 relative z-10"
                        style={{ width: "max-content" }}
                    >
                        {projectsData.map((project, index) => (
                            <div
                                key={project.id}
                                ref={index === projectsData.length - 1 ? lastCardRef : null}
                                className="project-card group flex flex-col w-[clamp(300px,26vw,460px)] h-[clamp(400px,32vw,580px)] flex-shrink-0 cursor-pointer shadow-2xl mt-0 overflow-hidden rounded-tl-[clamp(30px,3vw,40px)] rounded-br-[clamp(30px,3vw,40px)] opacity-0"
                                style={{ opacity: 0 }}
                            >
                                <div className="w-full h-1/2 flex-1 overflow-hidden bg-gray-900 relative">
                                    <Image
                                        src={projectImageUrls[project.imgSrc] || project.imgSrc}
                                        alt={project.title}
                                        fill
                                        unoptimized
                                        sizes="(max-width: 768px) 100vw, 460px"
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-150"
                                    />
                                </div>

                                <div className="p-5 md:p-6 flex flex-col justify-between h-1/2 flex-1 bg-white group-hover:bg-[#9BE7FF] transition-colors duration-500">
                                    <div>
                                        <h3 className="text-[clamp(1.5rem,2.5vw,3rem)] font-bold mb-[clamp(0.2rem,0.4vw,0.4rem)] tracking-tight text-black transition-colors duration-500 leading-tight">
                                            {project.title}
                                        </h3>
                                        <div className="text-[clamp(14px,1.35vw,22px)] font-bold text-gray-800 transition-colors duration-500 mb-[clamp(0.35rem,0.6vw,0.6rem)] whitespace-nowrap">
                                            {project.category}
                                        </div>
                                        <p className="text-[clamp(13px,1.3vw,20px)] text-gray-600 transition-colors duration-500 leading-relaxed">
                                            {project.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile / Tablet View */}
            <div className="block lg:hidden w-full bg-[#071036] text-white overflow-hidden">
                <div data-navbar="dark" className="relative w-full h-screen min-h-[500px] overflow-hidden flex flex-col items-center justify-center px-5 py-10 text-center bg-black">
                    <img
                        src={mobilePosterUrl}
                        alt=""
                        fetchPriority="high"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <video
                        ref={mobileVideoRef}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={mobilePosterUrl}
                    >
                        <source src={mobileVideoUrl} />
                    </video>
                    <div className="absolute inset-0 bg-[#004455]/50 z-10" />
                    <div className="mobile-sec-1 relative z-20 max-w-xl mx-auto flex flex-col items-center justify-center space-y-3 px-3 text-center">
                        <h1
                            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center drop-shadow-md px-1 leading-snug tracking-tight"
                            style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}
                        >
                            {t("hero.subtitle_title")}
                        </h1>
                        <p className="text-sm sm:text-base text-white/90 text-center drop-shadow-sm px-1 mx-auto leading-relaxed max-w-md">
                            {heroSubtitle}
                        </p>
                        <div className="pt-2">
                            <Button
                                href="/we-do"
                                size="sm"
                                className="shadow-md text-xs sm:text-sm py-2 px-5"
                            >
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
                                    <>
                                        {t("hero.why_choose")} <span className="text-[#34CBEA] fuji-text">{t("about.fujisakura")}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[#34CBEA] fuji-text">{t("about.fujisakura")}</span>{t("hero.why_choose")}
                                    </>
                                )}
                            </h2>
                            <p className="text-base sm:text-xl text-white/80 mb-4 leading-relaxed">
                                {t("hero.why_choose_desc")}
                            </p>
                        </div>

                        <div className="mobile-sec-4 w-full flex flex-col items-center">
                            <div
                                className="w-full overflow-hidden relative px-2 sm:px-6 md:px-10 max-w-5xl"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div
                                    ref={mobileTrackRef}
                                    className="flex w-full will-change-transform"
                                >
                                    {projectsData.map((project) => (
                                        <div key={project.id} className="w-full md:w-1/2 flex-shrink-0 px-3 sm:px-5 md:px-4 flex justify-center">
                                            <div className="flex flex-col w-full max-w-[420px] h-[440px] sm:h-[480px] bg-white text-black rounded-tl-[30px] rounded-br-[30px] overflow-hidden shadow-2xl transition-transform duration-500">
                                                <div className="w-full h-1/2 overflow-hidden bg-gray-900 relative">
                                                    <Image
                                                        src={projectImageUrls[project.imgSrc] || project.imgSrc}
                                                        alt={project.title}
                                                        fill
                                                        unoptimized
                                                        sizes="(max-width: 768px) 100vw, 420px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="p-6 flex flex-col justify-between h-1/2 bg-white">
                                                    <div>
                                                        <h3 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-black leading-snug">
                                                            {project.title}
                                                        </h3>
                                                        <div className="text-sm sm:text-base font-bold text-gray-800 mb-2 whitespace-nowrap">
                                                            {project.category}
                                                        </div>
                                                        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                                                            {project.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pagination Dots */}
                            <div className="flex items-center justify-center w-full max-w-[420px] px-6 mt-6 mx-auto">
                                <div className="flex items-center justify-center space-x-2">
                                    {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setMobileIndex(idx)}
                                            className={`h-2.5 rounded-full transition-all duration-300 ${mobileIndex === idx ? "w-8 bg-[#FFB54E]" : "w-2.5 bg-white/40"
                                                }`}
                                            aria-label={`Go to project card ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}