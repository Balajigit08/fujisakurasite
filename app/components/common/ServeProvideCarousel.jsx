"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

function CarouselImage({ src, alt, fill, width, height, sizes, className, draggable }) {
    if (!src) return null;
    const isLocalOrAbsolute = typeof src === "string" && (src.startsWith("/") || src.startsWith("http"));
    if (isLocalOrAbsolute) {
        return (
            <Image quality={100}
                src={src}
                alt={alt || ""}
                fill={fill}
                width={width}
                height={height}
                sizes={sizes}
                className={className}
                draggable={draggable}
            />
        );
    }
    return (
        <Image quality={100}
            src={src}
            alt={alt || ""}
            fill={fill}
            width={width}
            height={height}
            sizes={sizes}
            className={className}
            draggable={draggable}
        />
    );
}

function NotchedCardBg({ rounded = true }) {
    const bgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 350, height: 500 });

    useEffect(() => {
        const el = bgRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const rect = entry.target.getBoundingClientRect();
                setDimensions({
                    width: rect.width || 350,
                    height: rect.height || 500
                });
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const W = dimensions.width;
    const H = dimensions.height;
    const left = 16;
    const right = W - 16;
    const top = 16;
    const bottom = H - 16;
    const notchLeft = right - 84;
    const notchBottom = top + 84;

    const pathD = rounded ? `
        M ${left + 16},${top} 
        H ${notchLeft - 16} 
        Q ${notchLeft},${top} ${notchLeft},${top + 16} 
        V ${notchBottom - 16} 
        Q ${notchLeft},${notchBottom} ${notchLeft + 16},${notchBottom} 
        H ${right - 16} 
        Q ${right},${notchBottom} ${right},${notchBottom + 16} 
        V ${bottom - 16} 
        Q ${right},${bottom} ${right - 16},${bottom} 
        H ${left + 16} 
        Q ${left},${bottom} ${left},${bottom - 16} 
        V ${top + 16} 
        Q ${left},${top} ${left + 16},${top} 
        Z
    ` : `
        M ${left},${top} 
        H ${notchLeft} 
        V ${notchBottom} 
        H ${right} 
        V ${bottom} 
        H ${left} 
        Z
    `;

    return (
        <div ref={bgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <svg
                className="w-full h-full"
                viewBox={`0 0 ${W} ${H}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d={pathD}
                    fill="#FFFFFF"
                />
                <rect
                    x={right - 70}
                    y={top + 4}
                    width={70}
                    height={70}
                    rx={rounded ? "16" : "0"}
                    ry={rounded ? "16" : "0"}
                    fill="#FFFFFF"
                />
            </svg>
        </div>
    );
}

function CarouselCard({ item, cardClassName = "", onToggleExpand }) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);

    const toggle = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const nextState = !expanded;
        setExpanded(nextState);
        if (onToggleExpand) {
            onToggleExpand(nextState);
        }
    };

    const fullText = item.extraDesc ? `${item.desc} ${item.extraDesc}` : item.desc;

    return (
        <div
            className={`group relative shrink-0 w-[88vw] sm:w-[360px] lg:w-[clamp(420px,30vw,580px)] ${expanded
                ? "min-h-[500px] sm:min-h-[520px] lg:min-h-[clamp(540px,38vw,620px)] h-auto pb-6 sm:pb-8"
                : "min-h-[500px] sm:min-h-[520px] lg:h-[clamp(540px,38vw,655px)] h-auto pb-[26px] sm:pb-6"
                } pt-7 sm:pt-8 lg:pt-[clamp(2rem,2.5vw,2.5rem)] px-7 sm:px-8 lg:px-[clamp(2rem,2.5vw,2.5rem)] flex flex-col justify-between will-change-transform transform-gpu transition-all duration-300 pointer-events-auto ${cardClassName}`}
        >
            <NotchedCardBg rounded={true} />

            <div
                className="absolute flex items-center justify-center z-20 pointer-events-none rounded-[16px] overflow-hidden"
                style={{
                    top: "22px",
                    right: "18px",
                    width: "65px",
                    height: "65px",
                }}
            >
                <CarouselImage
                    src={item.image?.startsWith("/") ? item.image : `/FS-images/${item.image}.png`}
                    alt={item.name}
                    width={65}
                    height={65}
                    className="w-full h-full object-contain transition-transform duration-300"
                    draggable={false}
                />
            </div>

            <div className="relative z-10 flex flex-col justify-between flex-grow pointer-events-auto h-full gap-y-3">
                {/* Header Title (min-h-[64px] guarantees image always starts below the top-right notch on all cards) */}
                <div className="pt-1 pr-[76px] sm:pr-[84px] lg:pr-[24%] min-h-[64px] lg:min-h-[60px] flex items-center">
                    <h3 className="text-base sm:text-lg md:text-lg lg:text-[clamp(1.2rem,1.35vw,1.6rem)] leading-snug font-bold text-[#1B1B1B] tracking-tight transition-colors duration-300">
                        {item.name}
                    </h3>
                </div>

                {/* Card Image */}
                <div className="my-2.5 lg:my-3 w-[92%] sm:w-full h-[140px] sm:h-[165px] lg:h-[clamp(175px,13vw,220px)] rounded-tr-[16px] rounded-bl-[16px] lg:rounded-tr-[clamp(18px,1.5vw,24px)] lg:rounded-bl-[clamp(18px,1.5vw,24px)] overflow-hidden shadow-sm flex items-center justify-center mx-auto shrink-0 relative">
                    <CarouselImage
                        src={item.img?.startsWith("/") ? item.img : `/FS-images/${item.img}.jpg`}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 350px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        draggable={false}
                    />
                </div>

                {/* Description & Action Area */}
                <div className="flex flex-col flex-grow justify-between pointer-events-auto">
                    <div>
                        <p
                            className={`text-[#2E2E2E] text-sm sm:text-base lg:text-[clamp(0.95rem,1.05vw,1.2rem)] leading-relaxed font-normal break-words ${expanded ? "" : "line-clamp-10 sm:line-clamp-7 lg:line-clamp-7"
                                }`}
                        >
                            {fullText}
                        </p>

                        {expanded && item.points && item.points.length > 0 && (
                            <ul className="pt-3 mt-2 space-y-1.5 border-t border-slate-200/80">
                                {item.points.map((point, pi) => (
                                    <li
                                        key={pi}
                                        className="flex items-start gap-2 text-xs sm:text-sm lg:text-[clamp(0.85rem,0.95vw,1.05rem)] text-[#1B1B1B] font-normal"
                                    >
                                        <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                                        <span className="leading-snug">
                                            {point}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Bottom-Aligned Read More / Read Less Button */}
                    <div className="-mt-[10px] pt-3 flex items-center">
                        <button
                            className="inline-flex items-center text-[#ffb54e] hover:text-[#e09838] font-semibold transition-colors duration-300 cursor-pointer whitespace-nowrap text-xs sm:text-sm lg:text-[clamp(0.85rem,0.95vw,1.05rem)] select-none z-30"
                            onClick={toggle}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            type="button"
                        >
                            {expanded ? (t("industries.read_less") || "Read Less") : (t("industries.read_more") || "Read More")}
                            <svg
                                className={`ml-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 transform transition-transform duration-300 shrink-0 ${expanded ? "rotate-180" : ""
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ServeProvideCarousel({
    id = "serve-provide-cards-section",
    items = [],
    i18nNamespace = "",
    cardClassName = "",
    bgColor = "bg-[#D6EEF7]"
}) {
    const { t } = useLanguage();
    const sectionRef = useRef(null);
    const scrollRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);

    const isMouseDown = useRef(false);
    const lastMouseX = useRef(0);
    const isTouchActive = useRef(false);
    const lastTouchX = useRef(0);
    const isHovering = useRef(false);
    const expandedCountRef = useRef(0);
    const animFrameId = useRef(null);
    const resumeTimeout = useRef(null);
    const scrollPosRef = useRef(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isHorizontalDrag = useRef(false);

    // 3-set buffer for infinite left and right scrolling
    const repeatedItems = [...items, ...items, ...items].map((s) => {
        if (!i18nNamespace) return s;
        const translatedItem = t(`${i18nNamespace}.${s.id}`);
        return {
            ...s,
            name: (translatedItem && typeof translatedItem === "object" && translatedItem.title) || (i18nNamespace === "industries_list" ? t("domains." + s.id) : null) || s.name,
            desc: (translatedItem && typeof translatedItem === "object" && translatedItem.desc) || s.desc,
            extraDesc: (translatedItem && typeof translatedItem === "object" && translatedItem.desc) ? "" : s.extraDesc,
            points: (translatedItem && typeof translatedItem === "object" && translatedItem.points) || s.points,
        };
    });

    const handleCardToggle = (isExpanded) => {
        if (isExpanded) {
            expandedCountRef.current += 1;
        } else {
            expandedCountRef.current = Math.max(0, expandedCountRef.current - 1);
        }
    };

    // Auto-scroll loop with infinite middle-buffer wrapping
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        // Start in the middle buffer set so user can drag left or right immediately
        const oneThird = el.scrollWidth / 3;
        if (oneThird > 0 && (el.scrollLeft === 0 || el.scrollLeft < oneThird * 0.5)) {
            el.scrollLeft = oneThird;
        }
        scrollPosRef.current = el.scrollLeft;

        let lastTime = performance.now();

        const step = (time) => {
            const delta = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;

            if (el) {
                const oneThirdWidth = el.scrollWidth / 3;
                if (oneThirdWidth > 0) {
                    if (el.scrollLeft >= 2 * oneThirdWidth) {
                        el.scrollLeft -= oneThirdWidth;
                    } else if (el.scrollLeft <= oneThirdWidth * 0.2) {
                        el.scrollLeft += oneThirdWidth;
                    }
                }

                if (!isHovering.current && !isMouseDown.current && !isTouchActive.current && expandedCountRef.current === 0) {
                    scrollPosRef.current = el.scrollLeft + 45 * delta;
                    el.scrollLeft = scrollPosRef.current;
                } else {
                    scrollPosRef.current = el.scrollLeft;
                }
            }
            animFrameId.current = requestAnimationFrame(step);
        };

        animFrameId.current = requestAnimationFrame(step);

        return () => {
            if (animFrameId.current) {
                cancelAnimationFrame(animFrameId.current);
            }
            if (resumeTimeout.current) {
                clearTimeout(resumeTimeout.current);
            }
        };
    }, [items]);

    // Window mouse events for smooth continuous dragging in both directions (left & right)
    useEffect(() => {
        const handleWindowMouseMove = (e) => {
            if (!isMouseDown.current || !scrollRef.current) return;
            e.preventDefault();
            const el = scrollRef.current;
            const dx = e.clientX - lastMouseX.current;
            lastMouseX.current = e.clientX;

            const oneThirdWidth = el.scrollWidth / 3;
            let newScroll = el.scrollLeft - dx * 1.25;

            if (oneThirdWidth > 0) {
                if (newScroll >= 2 * oneThirdWidth) {
                    newScroll -= oneThirdWidth;
                } else if (newScroll <= oneThirdWidth * 0.2) {
                    newScroll += oneThirdWidth;
                }
            }

            el.scrollLeft = newScroll;
            scrollPosRef.current = newScroll;
        };

        const handleWindowMouseUp = () => {
            if (isMouseDown.current) {
                isMouseDown.current = false;
                setIsDragging(false);
                if (scrollRef.current) {
                    scrollPosRef.current = scrollRef.current.scrollLeft;
                }
            }
        };

        window.addEventListener("mousemove", handleWindowMouseMove, { passive: false });
        window.addEventListener("mouseup", handleWindowMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleWindowMouseMove);
            window.removeEventListener("mouseup", handleWindowMouseUp);
        };
    }, []);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        const el = scrollRef.current;
        if (!el) return;
        isMouseDown.current = true;
        setIsDragging(true);
        lastMouseX.current = e.clientX;
        scrollPosRef.current = el.scrollLeft;
    };

    const handleMouseEnter = () => {
        if (typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            isHovering.current = true;
        }
    };

    const handleMouseLeave = () => {
        if (!isMouseDown.current) {
            isHovering.current = false;
        }
    };

    const handleTouchStart = (e) => {
        if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
        isTouchActive.current = true;
        const el = scrollRef.current;
        if (!el) return;
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        lastTouchX.current = e.touches[0].clientX;
        scrollPosRef.current = el.scrollLeft;
        isHorizontalDrag.current = false;
    };

    const handleTouchMove = (e) => {
        const el = scrollRef.current;
        if (!el || !isTouchActive.current) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - touchStartX.current;
        const diffY = currentY - touchStartY.current;

        if (!isHorizontalDrag.current && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
            isHorizontalDrag.current = true;
        }

        if (isHorizontalDrag.current) {
            const dx = currentX - lastTouchX.current;
            lastTouchX.current = currentX;

            const oneThirdWidth = el.scrollWidth / 3;
            let newScroll = el.scrollLeft - dx;

            if (oneThirdWidth > 0) {
                if (newScroll >= 2 * oneThirdWidth) {
                    newScroll -= oneThirdWidth;
                } else if (newScroll <= oneThirdWidth * 0.2) {
                    newScroll += oneThirdWidth;
                }
            }

            el.scrollLeft = newScroll;
            scrollPosRef.current = newScroll;
        }
    };

    const handleTouchEnd = () => {
        if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
        isHorizontalDrag.current = false;
        resumeTimeout.current = setTimeout(() => {
            isTouchActive.current = false;
            isHovering.current = false;
            if (scrollRef.current) {
                scrollPosRef.current = scrollRef.current.scrollLeft;
            }
        }, 1000);
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const oneThirdWidth = el.scrollWidth / 3;
        if (oneThirdWidth > 0) {
            if (el.scrollLeft >= 2 * oneThirdWidth) {
                el.scrollLeft -= oneThirdWidth;
                scrollPosRef.current = el.scrollLeft;
            } else if (el.scrollLeft <= oneThirdWidth * 0.2) {
                el.scrollLeft += oneThirdWidth;
                scrollPosRef.current = el.scrollLeft;
            }
        }
    };

    return (
        <section
            id={id}
            ref={sectionRef}
            data-cursor="drag"
            className={`relative w-full ${bgColor} py-[clamp(1.25rem,4vw,3rem)] flex flex-col justify-center z-10 overflow-hidden transition-colors duration-500`}
        >
            <div className="w-full overflow-hidden">
                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onScroll={handleScroll}
                    onDragStart={(e) => e.preventDefault()}
                    className={`flex flex-row items-start gap-[clamp(1.5rem,2.5vw,3rem)] w-full py-[clamp(1.5rem,2vw,2rem)] px-[clamp(1.5rem,5vw,4rem)] overflow-x-auto select-none scrollbar-none transition-colors duration-300 ${isDragging ? "cursor-grabbing" : "cursor-grab"
                        }`}
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {repeatedItems.map((item, index) => (
                        <CarouselCard
                            key={`${item.id}-${index}`}
                            item={item}
                            cardClassName={cardClassName}
                            onToggleExpand={handleCardToggle}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
