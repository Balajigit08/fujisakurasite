"use client";

import { useRef } from "react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function HeaderImage({ image }) {
    if (!image?.src) return null;
    const isLocalOrAbsolute = image.src.startsWith("/") || image.src.startsWith("http");
    if (isLocalOrAbsolute) {
        return (
            <Image
                src={image.src}
                alt={image.alt || ""}
                fill
                sizes="250px"
                className="object-cover object-center"
            />
        );
    }
    return (
        <CldImage
            src={image.src}
            alt={image.alt || ""}
            fill
            sizes="250px"
            className="object-cover object-center"
        />
    );
}

export default function PageHeader({
    id = "page-header-section",
    leftImage = null,
    rightImage = null,
    leftImageElement = null,
    rightImageElement = null,
    titlePrefix,
    titleHighlight,
    subhead = null,
    descriptions = [],
    children = null,
}) {
    const sectionRef = useRef(null);
    const leftImageRef = useRef(null);
    const rightImageRef = useRef(null);

    useGSAP(() => {
        if (!sectionRef.current || (!leftImageRef.current && !rightImageRef.current)) return;

        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            if (leftImageRef.current) {
                gsap.fromTo(
                    leftImageRef.current,
                    {
                        y: 0,
                        opacity: 1,
                    },
                    {
                        y: -260,
                        opacity: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: true,
                            markers: false,
                        },
                    }
                );
            }

            if (rightImageRef.current) {
                gsap.fromTo(
                    rightImageRef.current,
                    {
                        y: 0,
                        opacity: 1,
                    },
                    {
                        y: 260,
                        opacity: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: true,
                            markers: false,
                        },
                    }
                );
            }
        });

        return () => mm.revert();
    }, { scope: sectionRef });

    return (
        <section
            id={id}
            data-navbar="light"
            ref={sectionRef}
            className="bg-[#FFFFFF] w-full pt-20 sm:pt-32 lg:pt-[clamp(5.5rem,8vw,7.5rem)] relative overflow-hidden mb-8 lg:mb-15"
        >
            {(leftImage || leftImageElement) && (
                <div
                    ref={leftImageRef}
                    className="hidden lg:block absolute left-[clamp(1rem,3vw,11.25rem)] top-[clamp(33%,55%,66%)] w-[clamp(10.5rem,12vw,13.25rem)] h-[clamp(12.5rem,14vw,15rem)] rounded-tl-[clamp(30px,4vw,50px)] rounded-br-[clamp(30px,4vw,50px)] rounded-tr-none rounded-bl-none overflow-hidden will-change-transform z-10 shadow-md"
                >
                    {leftImageElement || <HeaderImage image={leftImage} />}
                </div>
            )}

            {(rightImage || rightImageElement) && (
                <div
                    ref={rightImageRef}
                    className="hidden lg:block absolute right-[clamp(1rem,3vw,11.25rem)] top-[clamp(25%,30%,33%)] w-[clamp(10.5rem,12vw,13.25rem)] h-[clamp(12.5rem,14vw,15rem)] rounded-tl-[clamp(30px,4vw,50px)] rounded-br-[clamp(30px,4vw,50px)] rounded-tr-none rounded-bl-none overflow-hidden will-change-transform z-10 shadow-md"
                >
                    {rightImageElement || <HeaderImage image={rightImage} />}
                </div>
            )}

            <div className="w-full lg:w-[clamp(70%,70vw,1280px)] mx-auto px-5 md:px-10 lg:px-12 relative z-10 pt-5">
                <div className="w-full max-w-4xl lg:max-w-[clamp(78%,70vw,1000px)] mx-auto text-center">
                    <h1 className="flex flex-wrap items-baseline justify-center gap-x-2 sm:gap-x-3 md:gap-x-[clamp(0.5rem,1vw,1rem)] mb-4 sm:mb-6 md:mb-[clamp(1rem,2vw,2.5rem)] text-center">
                        <span className="whitespace-nowrap text-3xl sm:text-4xl md:text-[clamp(1.875rem,3vw,4.5rem)] font-normal text-[#1B1B1B]">
                            {titlePrefix}
                        </span>{" "}
                        <span className="whitespace-nowrap text-4xl sm:text-5xl md:text-[clamp(3rem,5vw,6rem)] font-bold text-[#34CBEA] leading-none">
                            {titleHighlight}
                        </span>
                    </h1>

                    {subhead && (
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[clamp(1.25rem,1.8vw,2.25rem)] font-bold text-[#1B1B1B] mb-6 sm:mb-8 md:mb-10 leading-snug tracking-tight max-w-3xl mx-auto">
                            {subhead}
                        </h2>
                    )}

                    {descriptions && descriptions.length > 0 && (
                        <div className="space-y-4 sm:space-y-6 md:space-y-[clamp(1.5rem,2.5vw,3.5rem)] text-[#2E2E2E] text-base sm:text-lg md:text-[clamp(1.125rem,1.5vw,2.5rem)] leading-relaxed md:leading-[clamp(1.5,1.5vw,1.6)] font-normal">
                            {descriptions.map((desc, idx) => (
                                <p key={idx}>{desc}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {children}
        </section>
    );
}
