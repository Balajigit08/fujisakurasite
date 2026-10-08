"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiPlus, FiMinus } from "react-icons/fi";
import { DisplacementHoverImage } from "../../components/imghover/ImageHover";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Button from "@/app/components/common/Button";
import { useDeferredScrollAnimation } from "@/app/components/common/useDeferredScrollAnimation";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const clientCentricImg = "https://res.cloudinary.com/npifodto/image/upload/c_limit,w_800/f_auto/q_auto/v1/client-centric-approach";
const effectiveCollabImg = "https://res.cloudinary.com/npifodto/image/upload/c_limit,w_800/f_auto/q_auto/v1/effective-collaboration";
const qualityDeliveredImg = "https://res.cloudinary.com/npifodto/image/upload/c_limit,w_800/f_auto/q_auto/v1/quality-delivered";

function ExpandPanel({ isOpen, text }) {
    const panelRef = useRef(null);
    const innerRef = useRef(null);
    const isMounted = useRef(false);

    useEffect(() => {
        const panel = panelRef.current;
        const inner = innerRef.current;
        if (!panel || !inner) return;

        if (!isMounted.current) {
            isMounted.current = true;
            if (!isOpen) return;
        }

        if (isOpen) {
            gsap.fromTo(
                panel,
                { height: 0, opacity: 0 },
                {
                    height: inner.scrollHeight,
                    opacity: 1,
                    duration: 0.45,
                    ease: "power2.inOut",
                    onComplete: () => {
                        panel.style.height = "auto";
                        ScrollTrigger.refresh();
                    },
                }
            );
        } else {
            gsap.fromTo(
                panel,
                { height: panel.offsetHeight, opacity: 1 },
                {
                    height: 0,
                    opacity: 0,
                    duration: 0.35,
                    ease: "power2.inOut",
                    onComplete: () => {
                        ScrollTrigger.refresh();
                    },
                }
            );
        }
    }, [isOpen]);

    return (
        <div
            ref={panelRef}
            style={{ height: 0, overflow: "hidden", opacity: 0 }}
            className={`bg-white text-black transition-colors duration-500 relative z-10 ${!isOpen ? "group-hover:bg-[#0B63E5] group-hover:text-white" : ""
                }`}
        >
            <div ref={innerRef} className="px-[clamp(1.25rem,2.2vw,2.25rem)] pb-[clamp(1.25rem,2vw,2rem)]">
                <div style={{ paddingTop: "clamp(0.4rem,0.6vw,0.6rem)" }}>
                    <p className="hero-desc-style1 text-inherit text-center transition-colors duration-500">
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function OurValues() {
    const { t } = useLanguage();
    const [openCard, setOpenCard] = useState(null);

    const VALUES_DATA = useMemo(() => [
        {
            num: "1",
            title: t("values.value_1_title"),
            img: clientCentricImg,
            detail: t("values.value_1_detail"),
        },
        {
            num: "2",
            title: t("values.value_2_title"),
            img: effectiveCollabImg,
            detail: t("values.value_2_detail"),
        },
        {
            num: "3",
            title: t("values.value_3_title"),
            img: qualityDeliveredImg,
            detail: t("values.value_3_detail"),
        },
    ], [t]);

    const valuesSectionRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const firstImgRef = useRef(null);
    const secondImgRef = useRef(null);

    const handleReadMore = (num) => {
        setOpenCard((prev) => (prev === num ? null : num));
    };

    useDeferredScrollAnimation(() => {
        const mm = gsap.matchMedia();

        if (valuesSectionRef.current) {
            mm.add("(max-width: 1023px)", () => {
                gsap.fromTo(valuesSectionRef.current,
                    { x: -50, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: valuesSectionRef.current, start: "top 85%" } }
                );
            });

            ScrollTrigger.create({
                trigger: valuesSectionRef.current,
                start: "bottom center",
                onLeave: () => setOpenCard(null),
            });
        }

        if (scrollContainerRef.current && secondImgRef.current) {
            mm.add("(min-width: 1024px)", () => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: scrollContainerRef.current,
                        start: "top top",
                        end: "+=150%",
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                    },
                });

                tl.fromTo(
                    secondImgRef.current,
                    { xPercent: 100 },
                    { xPercent: 0, ease: "power2.inOut" }
                );
            });

            mm.add("(max-width: 1023px)", () => {
                if (firstImgRef.current) {
                    gsap.fromTo(firstImgRef.current,
                        { x: 50, opacity: 0 },
                        { x: 0, opacity: 1, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: firstImgRef.current, start: "top 85%" } }
                    );
                }
                if (secondImgRef.current) {
                    gsap.fromTo(secondImgRef.current,
                        { x: -50, opacity: 0 },
                        { x: 0, opacity: 1, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: secondImgRef.current, start: "top 85%" } }
                    );
                }
            });
        }

        return () => mm.revert();
    }, []);

    return (
        <div data-navbar="light" className="relative w-full text-[#333]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div ref={valuesSectionRef} className="py-[clamp(1.5rem,3vw,3.5rem)] flex flex-col justify-center relative w-full z-[60]">
                <div className="w-full max-w-7xl xl:max-w-[1380px] 2xl:max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-[clamp(2rem,4vw,3.5rem)]">
                        <p className="text-[#003154] font-bold text-[clamp(1.25rem,2.2vw,2.5rem)] tracking-wider mb-[clamp(0.4rem,0.6vw,0.6rem)]">
                            {t("values.section_title")}
                        </p>
                        <p className="hero-desc-style max-w-[clamp(80%,65vw,1080px)] mx-auto text-[#6E6C6C] font-light">
                            {t("values.section_subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(1.25rem,2.5vw,2.5rem)] items-start">
                        {VALUES_DATA.map((item) => {
                            const isOpen = openCard === item.num;
                            return (
                                <div
                                    key={item.num}
                                    className="group rounded-2xl overflow-hidden flex flex-col border border-gray-200/80 bg-white cursor-pointer transition-all duration-500 shadow-xs hover:shadow-lg relative md:last:col-span-2 md:last:w-full md:last:max-w-[calc(50%-0.625rem)] md:last:mx-auto lg:last:col-span-1 lg:last:max-w-none lg:last:mx-0"
                                >
                                    <div className="img-container w-full h-[clamp(240px,20vw,380px)] overflow-hidden relative bg-gray-900 rounded-t-2xl block">
                                        <DisplacementHoverImage
                                            src={item.img}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className={`p-[clamp(1.5rem,2.5vw,2.75rem)] flex flex-col justify-between text-center bg-white text-black transition-colors duration-500 relative z-10 ${!isOpen ? "group-hover:bg-[#34cbea] group-hover:text-white" : ""
                                        }`}>
                                        <div>
                                            <h3 className="text-[clamp(1.15rem,1.4vw,2rem)] font-bold text-inherit leading-snug mb-[clamp(1rem,1.5vw,1.5rem)] tracking-tight transition-colors duration-500">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <div className="pt-[clamp(0.4rem,0.6vw,0.6rem)]">
                                            <Button
                                                onClick={() => handleReadMore(item.num)}
                                                className="text-[clamp(13px,1.05vw,17px)] font-bold tracking-wider uppercase px-[clamp(1rem,1.15vw,1.4rem)] py-[clamp(0.45rem,0.55vw,0.8rem)]"
                                            >
                                                <span>{isOpen ? t("values.close") : t("values.read_more")}</span>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                                                    }}
                                                >
                                                    {isOpen ? (
                                                        <FiMinus className="w-[clamp(1.1rem,1.4vw,1.5rem)] h-[clamp(1.1rem,1.4vw,1.5rem)]" />
                                                    ) : (
                                                        <FiPlus className="w-[clamp(1.1rem,1.4vw,1.5rem)] h-[clamp(1.1rem,1.4vw,1.5rem)]" />
                                                    )}
                                                </span>
                                            </Button>
                                        </div>
                                    </div>

                                    <ExpandPanel isOpen={isOpen} text={item.detail} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div
                data-navbar="light"
                ref={scrollContainerRef}
                className="relative w-full overflow-hidden mt-[clamp(1rem,1.5vw,2.5rem)] flex flex-col lg:block lg:h-screen gap-6 sm:gap-10"
            >
                <div
                    ref={firstImgRef}
                    className="first-image-container relative lg:absolute lg:inset-0 overflow-hidden z-10 w-full min-h-[480px] sm:min-h-[550px] lg:min-h-0 lg:h-full py-16 sm:py-20 px-6 sm:px-12 flex items-center justify-center shadow-xl"
                >
                    <Image src="https://res.cloudinary.com/npifodto/image/upload/c_limit,w_1200/f_auto/q_auto/v1/vision" alt="Vision" fill unoptimized sizes="100vw" className="object-cover -z-10" />
                    <div className="absolute inset-0 bg-black/60 z-10" />

                    <div className="relative flex flex-col items-center justify-center p-4 sm:p-8 z-20 text-white text-center">
                        <h2 className="text-[#34CBEA] text-3xl sm:text-5xl lg:text-[clamp(2.5rem,4.5vw,6rem)] font-bold mb-4 sm:mb-6 tracking-wide uppercase">
                            {t("values.vision_title")}
                        </h2>
                        <p className="hero-desc-style w-full max-w-[95%] sm:max-w-[85%] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl text-center text-white/95 drop-shadow-sm">
                            {t("values.vision_desc")}
                        </p>
                    </div>
                </div>

                <div
                    ref={secondImgRef}
                    className="second-image-container relative lg:absolute lg:inset-0 overflow-hidden z-20 w-full min-h-[480px] sm:min-h-[550px] lg:min-h-0 lg:h-full py-16 sm:py-20 px-6 sm:px-12 flex items-center justify-center shadow-xl"
                >
                    <Image src="https://res.cloudinary.com/npifodto/image/upload/c_limit,w_1200/f_auto/q_auto/v1/mission" alt="Mission" fill unoptimized sizes="100vw" className="object-cover -z-10" />

                    <div className="absolute inset-0 z-10" />

                    <div className="relative flex flex-col items-center justify-center p-4 sm:p-8 z-20 text-black text-center">
                        <h2 className="text-[#34CBEA] text-3xl sm:text-5xl lg:text-[clamp(2.5rem,4.5vw,6rem)] font-bold mb-4 sm:mb-6 tracking-wide uppercase">
                            {t("values.mission_title")}
                        </h2>
                        <p className="hero-desc-style w-full max-w-[95%] sm:max-w-[85%] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl text-center text-black/95 drop-shadow-sm">
                            {t("values.mission_desc")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}