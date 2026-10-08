"use client";

import { useRef } from "react";
import { CldImage } from "next-cloudinary";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function LocationScroll({ country, mapImage, blocks, pinPosition, overlapNext = false }) {
    const sectionRef = useRef(null);
    const desktopContainerRef = useRef(null);
    const mapTextRef = useRef(null);
    // GSAP ScrollTrigger timeline for desktop pinned information sequence
    useGSAP(() => {
        if (!sectionRef.current) return;

        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            const validBlocks = gsap.utils.toArray(".location-desktop-block", sectionRef.current);
            if (!desktopContainerRef.current || !mapTextRef.current || validBlocks.length === 0) return;

            const STEP_DURATION = 3.0;
            // Add extra scroll distance to account for the overlapping next section if requested
            const extraScroll = overlapNext ? window.innerHeight * 1.5 : 0;
            const scrollDist = validBlocks.length * 700 + extraScroll;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: `+=${scrollDist}`,
                    pin: desktopContainerRef.current,
                    scrub: 0.6,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            gsap.set(mapTextRef.current, { x: -30, opacity: 0 });
            gsap.set(validBlocks, { opacity: 0, y: 40 });

            tl.to(
                mapTextRef.current,
                { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
                0
            );

            validBlocks.forEach((block, index) => {
                const isLast = index === validBlocks.length - 1;
                const startTime = 0.4 + index * STEP_DURATION;

                tl.to(
                    block,
                    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
                    startTime
                );

                if (!isLast) {
                    tl.to(
                        block,
                        { opacity: 0, y: -40, duration: 0.8, ease: "power2.in" },
                        startTime + 2.0
                    );
                } else {
                    // Much longer pause on the last block so it stays visible while the next section overlaps
                    const endDuration = overlapNext ? 6.0 : 1.2;
                    tl.to({}, { duration: endDuration }, startTime + 0.8);
                }
            });
        });

        mm.add("(max-width: 1023px)", () => {
            if (!desktopContainerRef.current || !mapTextRef.current) return;

            gsap.timeline({
                scrollTrigger: {
                    trigger: desktopContainerRef.current,
                    start: "top 20%",
                    toggleActions: "play none none reverse",
                },
            }).fromTo(
                mapTextRef.current,
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8 }
            );

            const mobileBlocks = gsap.utils.toArray(".location-mobile-block", sectionRef.current);
            mobileBlocks.forEach((block) => {
                if (!block) return;
                gsap.fromTo(
                    block,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: block,
                            start: "top 75%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            });
        });

        return () => mm.revert();
    }, { scope: sectionRef, dependencies: [country, overlapNext], revertOnUpdate: true });

    const positionClasses = pinPosition || "right-[5%] md:right-[12%] top-1/2";

    return (
        <section id="location-scroll-section" ref={sectionRef} className="relative w-full bg-[#f8fafc]">
            {/* Desktop Pinned Map & Info View */}
            <div
                ref={desktopContainerRef}
                className="hidden lg:block relative top-0 h-screen w-full overflow-hidden z-0 bg-white"
            >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 md:px-12">
                    <div className="relative w-full max-w-[clamp(1000px,80vw,1600px)] aspect-[16/9] flex items-center justify-center">
                        <CldImage
                            src={mapImage}
                            alt={`${country} Map`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 80vw"
                            className="object-contain block"
                        />

                        <div className={`absolute -translate-x-1/2 -translate-y-full z-20 flex items-center gap-2 md:gap-3 leading-none ${positionClasses}`}>
                            <div ref={mapTextRef} className="flex flex-col leading-none">
                                <h2 className="text-[clamp(2.25rem,5.5vw,8rem)] font-black text-slate-900 tracking-tighter drop-shadow-md uppercase whitespace-nowrap">
                                    {country}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex absolute left-[8%] inset-y-0 lg:w-[50%] 2xl:w-[70%] z-10 pointer-events-none items-center">
                    <div className="relative w-full h-[clamp(280px,22vw,420px)]">
                        {blocks.map((block, i) => (
                            <div key={i} className="absolute inset-0 flex flex-col justify-center">
                                <div className="location-desktop-block w-full opacity-0 pointer-events-auto">
                                    <h3 className="text-[clamp(2rem,2.8vw,3.75rem)] font-black text-black leading-tight drop-shadow-sm mb-2">
                                        {block.title}
                                    </h3>
                                    <p className="text-[clamp(1.25rem,1.6vw,2rem)] font-medium text-slate-800 leading-relaxed">
                                        {Array.isArray(block.desc)
                                            ? block.desc.map((line, lineIndex) => (
                                                <span key={lineIndex} className="block">
                                                    {line}
                                                </span>
                                            ))
                                            : block.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden w-full pt-4 pb-12 sm:pt-6 sm:pb-16 px-5 sm:px-8 bg-white border-b border-slate-100">
                <div className="w-full flex flex-col items-center text-center mb-8">
                    <h2
                        className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase mb-4 whitespace-nowrap"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                        {country}
                    </h2>
                    <div className="w-full max-w-[360px] sm:max-w-[480px] aspect-[16/10] overflow-hidden flex items-center justify-center relative">
                        <CldImage
                            src={mapImage}
                            alt={`${country} Map`}
                            fill
                            sizes="480px"
                            className="object-contain block drop-shadow-md"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
                    {blocks.map((block, i) => {
                        const isOddTotal = blocks.length % 2 !== 0;
                        const isLastCard = i === blocks.length - 1;
                        const centerLastClass = isOddTotal && isLastCard
                            ? "md:col-span-2 md:w-full md:max-w-[calc(50%-0.75rem)] md:mx-auto lg:col-span-1 lg:max-w-none lg:mx-0"
                            : "";

                        return (
                            <div
                                key={i}
                                className={`location-mobile-block w-full pointer-events-auto bg-slate-50 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-center ${centerLastClass}`}
                            >
                                <h3 className="text-lg sm:text-xl font-extrabold text-black mb-2 leading-snug">
                                    {block.title}
                                </h3>
                                <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                                    {Array.isArray(block.desc)
                                        ? block.desc.map((line, lineIndex) => (
                                            <span key={lineIndex} className="block">
                                                {line}
                                            </span>
                                        ))
                                        : block.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}