"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

import HeroVideo from "./HeroVideo";
import AboutText from "./AboutText";
import WhyChooseUs from "./WhyChooseUs";
import MobileHeroAndAbout from "./MobileHeroAndAbout";
import FloatingImages from "./FloatingImages";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function CombinedHeroAndAbout() {
    const { t, lang } = useLanguage();
    const containerRef = useRef(null);

    // Desktop GSAP pinned scroll timeline and animation sequence
    useGSAP(
        () => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) return;
            if (!containerRef.current) return;

            const mm = gsap.matchMedia();

            mm.add("(min-width: 1024px)", () => {
                const W = window.innerWidth;
                const H = window.innerHeight;
                const scrollDist = Math.max(4800, H * 6);
                const insetX = (W - 200) / 2;
                const insetY = (H - 200) / 2;

                // Pre-measure geometry
                const cards = gsap.utils.toArray(".project-card");
                const totalCards = cards.length;
                if (totalCards === 0) return; // Prevent errors if DOM isn't ready

                const trackPositions = cards.map(card => {
                    const cardRight = card.offsetLeft + card.offsetWidth;
                    return -(cardRight - W * 0.92);
                });

                const initialTrackX = trackPositions[0];
                const finalTrackX = trackPositions[totalCards - 1];
                const totalTravel = Math.abs(finalTrackX - initialTrackX) || 1;

                const introTextFixed = gsap.utils.toArray(".intro-text-fixed")[0];
                const introRight = introTextFixed
                    ? introTextFixed.getBoundingClientRect().right
                    : W * 0.60;

                // Setup Initial States
                gsap.set(".video-wrapper", {
                    width: W,
                    height: H,
                    clipPath: "inset(0px 0px 0px 0px round 0px)",
                    opacity: 1,
                    autoAlpha: 1,
                    scale: 1,
                });

                gsap.set(".text-container", {
                    opacity: 0,
                    autoAlpha: 0,
                });

                gsap.set(".hero-subtitle", { autoAlpha: 0, y: 40 });
                gsap.set(".next-char", { opacity: 0 });
                gsap.set(".final-subtitle", { opacity: 0, y: 15 });
                gsap.set("#projects-wrapper", { zIndex: 20, autoAlpha: 0 });
                gsap.set(".intro-text-fixed", { x: 120, opacity: 0 });
                gsap.set(".project-card", { opacity: 0, x: 100 });
                gsap.set(".horizontal-track", { x: initialTrackX });

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
                        scrub: 1.5,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        snap: {
                            snapTo: "labelsDirectional",
                            duration: { min: 0.3, max: 0.8 },
                            delay: 0.15,
                            ease: "power1.inOut"
                        },
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

                if (window.scrollY < 80) {
                    applyNavStyles();
                } else {
                    clearNavStyles();
                }

                // SEQUENCE
                tl.addLabel("hero", 0);
                tl.to(".hero-line-1", { y: -H * 0.9, opacity: 0, ease: "power1.inOut", duration: 0.6 }, 0);

                tl.fromTo(
                    ".hero-subtitle",
                    { autoAlpha: 0, y: 40 },
                    { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
                    0.4
                );

                tl.addLabel("step1", 1.2);
                tl.to(".hero-subtitle", { autoAlpha: 0, ease: "power1.inOut", duration: 0.7 }, 2.8);

                // Video shrink is handled via an independent ScrollTrigger so it doesn't stop mid-way
                ScrollTrigger.create({
                    trigger: containerRef.current,
                    start: `top -${H * 1.2}px`, // Triggers around the time the subtitle fades out
                    onEnter: () => {
                        gsap.to(".video-wrapper", {
                            clipPath: `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round 20px)`,
                            ease: "power1.inOut",
                            duration: 0.8,
                            overwrite: "auto"
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to(".video-wrapper", {
                            clipPath: "inset(0px 0px 0px 0px round 0px)",
                            ease: "power1.inOut",
                            duration: 0.8,
                            overwrite: "auto"
                        });
                    }
                });

                tl.to(
                    containerRef.current,
                    { backgroundColor: "#FFFFFF", ease: "power1.inOut", duration: 0.5 },
                    3.2
                );

                tl.to(
                    ".video-wrapper",
                    { opacity: 0, scale: 0, ease: "power2.inOut", duration: 0.8 },
                    4.0
                );

                tl.to(
                    navProxy,
                    { opacity: 1, r: 0, g: 0, b: 0, duration: 1.0, ease: "power1.inOut", onUpdate: applyNavStyles },
                    3.8
                );

                tl.to(".text-container", { autoAlpha: 1, ease: "power2.out", duration: 0.8 }, 4.1);

                tl.addLabel("about", 4.1);
                tl.to(".floating-images-wrapper", { autoAlpha: 1, ease: "power2.out", duration: 0.8 }, 4.1);
                tl.to(".floating-img-up", { y: -200, ease: "none", duration: 1.8 }, 4.1);
                tl.to(".floating-img-down", { y: 200, ease: "none", duration: 1.8 }, 4.1);

                tl.to(".next-char", { opacity: 1, stagger: 0.01, duration: 0.5, ease: "power2.out" }, 4.3);
                tl.to(".final-subtitle", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 4.6);

                tl.addLabel("step2", 5.2);

                tl.to(".text-container", { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, 5.9);
                tl.to(".floating-images-wrapper", { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, 5.9);

                tl.to(
                    navProxy,
                    { opacity: 0, r: 255, g: 255, b: 255, duration: 0.6, ease: "power1.inOut", onUpdate: applyNavStyles },
                    "<"
                );

                tl.to("#projects-wrapper", { zIndex: 45, autoAlpha: 1, duration: 0.1 }, ">");
                tl.to(".project-bg-0", { opacity: 0.45, duration: 0.5, ease: "power2.out" }, "<");

                tl.to(".intro-text-fixed", { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "<");

                tl.to(".project-card", { opacity: 1, x: 0, stagger: 0.12, duration: 0.5, ease: "power3.out" }, "<");

                tl.addLabel("startScroll");
                tl.addLabel("card1", "startScroll");
                tl.addLabel("card2", "startScroll+=1");
                tl.addLabel("card3", "startScroll+=2");
                tl.addLabel("card4", "startScroll+=3");

                for (let i = 0; i < totalCards - 1; i++) {
                    const startTime = `startScroll+=${i}`;
                    tl.to(cards[i], { opacity: 0, duration: 0.35, ease: "power1.inOut" }, `${startTime}+=0.25`);
                    tl.to(
                        ".horizontal-track",
                        { x: trackPositions[i + 1], ease: "power2.inOut", duration: 0.7 },
                        startTime
                    );
                }

                tl.to(".project-bg-0", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "startScroll+=0.9");
                tl.to(".project-bg-1", { opacity: 0.45, duration: 0.5, ease: "power2.inOut" }, "startScroll+=0.9");
                tl.to(".project-bg-1", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "startScroll+=1.8");
                tl.to(".project-bg-2", { opacity: 0.45, duration: 0.5, ease: "power2.inOut" }, "startScroll+=1.8");
                tl.to(".project-bg-2", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "startScroll+=2.7");
                tl.to(".project-bg-3", { opacity: 0.45, duration: 0.5, ease: "power2.inOut" }, "startScroll+=2.7");

                tl.to({}, { duration: 1.5 });
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
        const timer = setTimeout(() => ScrollTrigger.refresh(), 300);
        return () => clearTimeout(timer);
    }, [lang]);

    return (
        <>
            <div data-navbar="dark" ref={containerRef} className="hidden lg:block relative w-full h-screen overflow-hidden select-none bg-[#071036] text-white will-change-[background-color]">
                <HeroVideo />
                <FloatingImages />
                <AboutText />
                <WhyChooseUs />
            </div>

            <div className="block lg:hidden w-full bg-[#071036] text-white overflow-hidden">
                <MobileHeroAndAbout />
            </div>
        </>
    );
}