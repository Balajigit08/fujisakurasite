import React from "react";
import Button from "@/app/components/common/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const desktopVideoUrl = "/videos/homepage-video.mp4";
const desktopPosterUrl = undefined;

export default function HeroVideo() {
    const { t } = useLanguage();
    const heroSubtitle = t("hero.subtitle");

    return (
        <>
            {/* The Video Background Layer */}
            <div
                className="video-wrapper absolute inset-0 z-[30] w-full h-full overflow-hidden flex items-center justify-center will-change-[clip-path,opacity,transform] bg-[#071036]"
            >
                <div className="absolute inset-0 bg-[#004455]/50 z-10 pointer-events-none" />
                <video
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

            {/* The Text Layer (Outside video-wrapper so it doesn't get clipped when video shrinks) */}
            <div className="absolute inset-0 z-[35] flex flex-col items-center justify-center w-full px-[clamp(2rem,6vw,6rem)] pointer-events-none">
                <h1
                    className="text-white text-center font-extrabold leading-[1.1] tracking-tight flex flex-col"
                    style={{ fontSize: "clamp(3rem,6.4vw,10rem)", fontFamily: '"Inter",sans-serif', textShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}
                >
                    <span className="hero-line-1 block will-change-transform">{t("hero.turning_vision")}</span>
                </h1>
                
                <div 
                    className="hero-subtitle absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-auto invisible opacity-0 w-full will-change-[opacity,transform]"
                    style={{ transform: "translateZ(0)" }}
                >
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
        </>
    );
}
