"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const navLinks = [
    { key: "who_we_are", href: "/about" },
    { key: "what_we_do", href: "/we-do" },
    { key: "industries", href: "/industries" },
    { key: "ai_services", href: "/ai-services" },
    { key: "career", href: "/career" },
];

const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "ja", label: "日本語", short: "JA" },
];

export default function Navbar() {
    const { lang, setLang, t } = useLanguage();
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isOverLightBg, setIsOverLightBg] = useState(() => pathname !== "/");
    const [isMobile, setIsMobile] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const navRef = useRef(null);
    const langDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const hamburgerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const isMobileRef = useRef(false);
    const isScrolledRef = useRef(false);
    const isOverLightBgRef = useRef(pathname !== "/");
    const navbarHeightRef = useRef(80);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    useEffect(() => {
        isMobileRef.current = window.innerWidth < 1024;

        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            if (mobile !== isMobileRef.current) {
                isMobileRef.current = mobile;
                setIsMobile(mobile);
            }
        };

        const handleScroll = () => {
            const scrolled = window.scrollY > 15;
            if (scrolled !== isScrolledRef.current) {
                isScrolledRef.current = scrolled;
                setIsScrolled(scrolled);
                if (isMobileRef.current) {
                    setIsMobile(true);
                }
            }
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!isLangOpen && !isMenuOpen) return;

        const handleClickOutside = (e) => {
            if (
                langDropdownRef.current &&
                !langDropdownRef.current.contains(e.target)
            ) {
                setIsLangOpen(false);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(e.target) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(e.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsLangOpen(false);
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isLangOpen, isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) return;

        if (typeof window !== "undefined" && window.lenis) {
            window.lenis.stop();
        }

        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalTouchAction = document.body.style.touchAction;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.style.touchAction = "none";

        return () => {
            if (typeof window !== "undefined" && window.lenis) {
                window.lenis.start();
            }

            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.touchAction = originalTouchAction;
        };
    }, [isMenuOpen]);

    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setIsMenuOpen(false);
        setIsLangOpen(false);
    }

    useEffect(() => {
        if (pathname !== "/") {
            if (navRef.current) {
                navRef.current.style.removeProperty("--nav-bg-opacity");
                navRef.current.style.removeProperty("--nav-color");
            }
            if (!isOverLightBgRef.current) {
                isOverLightBgRef.current = true;
                setIsOverLightBg(true);
            }
            return;
        }

        const checkBackground = () => {
            if (!navRef.current) return;

            const navbarCenter = navbarHeightRef.current / 2;
            const sections = document.querySelectorAll("[data-navbar]");
            let currentSection = null;

            for (const section of sections) {
                const rect = section.getBoundingClientRect();

                // Skip elements hidden by CSS (e.g. mobile-only sections on desktop)
                // rect.width/height === 0 is much faster than checking offsetParent
                if (rect.width === 0 && rect.height === 0) continue;

                if (rect.top <= navbarCenter && rect.bottom >= navbarCenter) {
                    currentSection = section;
                    break; // Stop querying once we find the intersecting section
                }
            }

            if (currentSection) {
                const isLight = currentSection.dataset.navbar === "light";
                if (isOverLightBgRef.current !== isLight) {
                    isOverLightBgRef.current = isLight;
                    setIsOverLightBg(isLight);
                }

                if (isLight && window.scrollY > 200) {
                    navRef.current.style.removeProperty("--nav-bg-opacity");
                    navRef.current.style.removeProperty("--nav-color");
                }
            }
            // When no section is found (lazy-loading gap, sub-pixel gap),
            // preserve the previous navbar state — do not force dark mode.
        };

        const scheduleUpdate = () => {
            if (animationFrameRef.current) return;
            animationFrameRef.current = requestAnimationFrame(() => {
                animationFrameRef.current = null;
                checkBackground();
            });
        };

        // checkBackground is triggered on scroll; avoid forced reflow during initial mount at scrollY = 0

        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate);

        return () => {
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [pathname, lang]);

    const isMobileActive = isMobile && (isScrolled || isMenuOpen);

    const defaultColor = isOverLightBg
        ? "#000000"
        : "#ffffff";

    const defaultBgOpacity = isOverLightBg ? "1" : "0";

    const navColor = isMobile
        ? isMobileActive
            ? "#000000"
            : pathname === "/"
                ? "#ffffff"
                : defaultColor
        : pathname === "/"
            ? `var(--nav-color, ${defaultColor})`
            : defaultColor;

    const navBgOpacity = isMobile
        ? isMobileActive
            ? 1
            : 0
        : pathname === "/"
            ? `var(--nav-bg-opacity, ${defaultBgOpacity})`
            : defaultBgOpacity;

    return (
        <div
            ref={navRef}
            id="main-navbar"
            className="fixed top-0 left-0 right-0 z-[999] transition-[transform] duration-300 translate-y-0"
            style={{
                color: navColor,
                transition: "color 0.3s ease",
            }}
        >
            <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isMobileActive
                    ? "bg-white/95 backdrop-blur-xl shadow-xs"
                    : "bg-gradient-to-b from-white/80 via-white/70 to-white/50 backdrop-blur-xl backdrop-saturate-150 shadow-xs"
                    }`}
                style={{
                    opacity: navBgOpacity,
                    transition: "opacity 0.3s ease",
                }}
            />

            <div className="relative z-10 flex justify-center py-[clamp(0.25rem,0.4vw,0.5rem)] px-[clamp(0.65rem,1vw,1.5rem)] nav-inner w-full mx-auto">
                <nav className="flex items-center justify-between w-full rounded-2xl">
                    <Link
                        href="/"
                        className="group relative flex items-center shrink-0 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <Image
                            src="/FS-images/fuji-logo.png"
                            alt="FujiSakura"
                            width={290}
                            height={90}
                            sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 290px"
                            className={`h-13 sm:h-14 lg:h-[clamp(2rem,3.5vw,6rem)] w-auto object-contain nav-logo relative z-10 transition-transform duration-300 cursor-pointer ${pathname === "/"
                                ? "logo-active-zoom"
                                : ""
                                }`}
                            priority
                        />
                    </Link>

                    <ul className="hidden lg:flex items-center gap-[clamp(1.3rem,2.2vw,2.4rem)] nav-menu-list">
                        {navLinks.map(({ key, href }) => {
                            const isActive =
                                pathname === href ||
                                (href !== "/" &&
                                    pathname.startsWith(href));

                            return (
                                <li key={key}>
                                    <Link
                                        href={href}
                                        prefetch={false}
                                        className="group relative pb-1 text-[clamp(12px,1.4vw,30px)] font-medium transition-colors nav-link-item"
                                    >
                                        {t(`navbar.${key}`)}

                                        <span
                                            className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-[#FFB54E] rounded-full transition-transform duration-300 origin-left ${isActive
                                                ? "scale-x-100"
                                                : "scale-x-0 group-hover:scale-x-100"
                                                }`}
                                        />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex items-center gap-2 sm:gap-[clamp(0.625rem,1vw,1.25rem)]">
                        <div
                            className="relative hidden lg:block"
                            ref={langDropdownRef}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setIsLangOpen((prev) => !prev)
                                }
                                aria-expanded={isLangOpen}
                                aria-haspopup="listbox"
                                aria-label="Select Language"
                                className="relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-current/25 bg-black/10 hover:bg-black/15 hover:border-[#FFB54E] active:scale-95 transition-all text-[clamp(12px,1.1vw,15px)] font-semibold cursor-pointer select-none touch-manipulation backdrop-blur-sm h-[clamp(2rem,2.8vw,2.6rem)] shadow-sm"
                            >
                                <span className="uppercase tracking-wider font-bold">
                                    {lang}
                                </span>

                                <svg
                                    className={`w-3.5 h-3.5 transition-transform duration-200 opacity-80 shrink-0 ${isLangOpen
                                        ? "rotate-180"
                                        : "rotate-0"
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2.5"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {isLangOpen && (
                                <div
                                    role="listbox"
                                    className="absolute right-0 top-[calc(100%+0.5rem)] min-w-[155px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-1.5 z-50 text-[#1a1a1a] animate-in fade-in slide-in-from-top-2 duration-150"
                                >
                                    {languages.map((item) => {
                                        const isSelected =
                                            lang === item.code;

                                        return (
                                            <button
                                                key={item.code}
                                                type="button"
                                                role="option"
                                                aria-selected={isSelected}
                                                onClick={() => {
                                                    setLang(item.code);
                                                    setIsLangOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-sm font-medium transition-all cursor-pointer select-none touch-manipulation ${isSelected
                                                    ? "bg-[#FFB54E]/20 text-[#1a1a1a] font-bold"
                                                    : "text-gray-700 hover:bg-black/5 hover:text-black"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${isSelected
                                                            ? "bg-[#FFB54E] text-[#1a1a1a]"
                                                            : "bg-black/5 text-gray-600"
                                                            }`}
                                                    >
                                                        {item.short}
                                                    </span>

                                                    <span>
                                                        {item.label}
                                                    </span>
                                                </div>

                                                {isSelected && (
                                                    <svg
                                                        className="w-4 h-4 text-[#FFB54E] shrink-0"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2.5"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/contact"
                            className="hidden lg:flex items-center px-[clamp(1.25rem,2.5vw,3rem)] py-[clamp(0.65rem,1vw,1rem)] bg-[#FFB54E] text-[#1a1a1a] font-semibold text-[clamp(13px,1.2vw,20px)] rounded-full hover:bg-[#e09e42] active:scale-95 transition-all flex-shrink-0 whitespace-nowrap contact-btn touch-manipulation"
                        >
                            {t("navbar.contact_us")}
                        </Link>

                        <button
                            ref={hamburgerRef}
                            type="button"
                            onClick={() => {
                                setIsMobile(true);
                                setIsMenuOpen((prev) => !prev);
                            }}
                            className="lg:hidden flex flex-col gap-1.5 p-2 -mr-2 cursor-pointer touch-manipulation select-none"
                            aria-label="Toggle menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span
                                className={`w-6 h-0.5 bg-current transition-all duration-300 pointer-events-none ${isMenuOpen
                                    ? "rotate-45 translate-y-2"
                                    : ""
                                    }`}
                            />

                            <span
                                className={`w-6 h-0.5 bg-current transition-all duration-300 pointer-events-none ${isMenuOpen ? "opacity-0" : ""
                                    }`}
                            />

                            <span
                                className={`w-6 h-0.5 bg-current transition-all duration-300 pointer-events-none ${isMenuOpen
                                    ? "-rotate-45 -translate-y-2"
                                    : ""
                                    }`}
                            />
                        </button>
                    </div>
                </nav>

                {isMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                            onClick={closeMenu}
                            onTouchMove={(e) => e.preventDefault()}
                            onWheel={(e) => e.preventDefault()}
                        />

                        <div
                            ref={mobileMenuRef}
                            data-lenis-prevent="true"
                            data-lenis-prevent-wheel="true"
                            data-lenis-prevent-touch="true"
                            className="absolute top-[calc(100%+0.5rem)] left-3 right-3 bg-white rounded-2xl shadow-2xl p-6 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-100 z-50 max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain"
                            style={{
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            <div className="flex flex-col">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.key}
                                        href={link.href}
                                        prefetch={false}
                                        onClick={closeMenu}
                                        className="block py-3 text-base font-medium text-[#444444] border-b border-slate-100 hover:text-[#FFB54E] active:text-[#FFB54E] transition-colors last:border-0 touch-manipulation"
                                    >
                                        {t(`navbar.${link.key}`)}
                                    </Link>
                                ))}

                                <div className="flex items-center gap-3 pt-4 mt-2 border-t border-slate-100">
                                    <div className="flex items-center p-1 bg-gray-100 rounded-full shrink-0 border border-slate-200/60 shadow-inner">
                                        {languages.map((item) => {
                                            const isSelected =
                                                lang === item.code;

                                            return (
                                                <button
                                                    key={item.code}
                                                    type="button"
                                                    onClick={() => {
                                                        setLang(item.code);
                                                        closeMenu();
                                                    }}
                                                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none touch-manipulation ${isSelected
                                                        ? "bg-[#FFB54E] text-[#1a1a1a] shadow-xs"
                                                        : "text-gray-600 hover:text-black"
                                                        }`}
                                                >
                                                    {item.short}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <Link
                                        href="/contact"
                                        onClick={closeMenu}
                                        className="flex-1 text-center bg-[#FFB54E] text-[#1a1a1a] font-semibold py-2.5 px-4 text-sm rounded-full hover:bg-[#e09e42] active:scale-98 transition-all touch-manipulation shadow-xs whitespace-nowrap"
                                    >
                                        {t("navbar.contact_us_mobile")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}