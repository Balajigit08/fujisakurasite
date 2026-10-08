import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function AboutText() {
    const { t } = useLanguage();
    
    return (
        <div
            className="text-container absolute z-40 pointer-events-none overflow-visible flex items-center justify-center opacity-0 invisible"
            style={{
                width: "100%",
                height: "100%",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                filter: "blur(0px)",
                WebkitFilter: "blur(0px)",
            }}
        >
            <div
                className="flex flex-col items-center justify-center text-center p-2 sm:p-3 will-change-transform"
                style={{ width: "max-content", transform: "translateZ(0)" }}
            >
                <h1
                    className="hero-heading-title final-heading text-black text-center"
                    style={{ whiteSpace: "nowrap" }}
                >
                    <div className="sentence flex items-center justify-center gap-[0.2em] flex-nowrap whitespace-nowrap">
                        <span className="big-word inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                            {t("hero.trusted_by").split("").map((char, i) => (
                                <span key={`n1${i}`} className="next-char inline-block opacity-0" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                    {char}
                                </span>
                            ))}
                        </span>
                        <span className="big-word font-bold inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                            {t("hero.businesses").split("").map((char, i) => (
                                <span key={`b1${i}`} className="next-char inline-block opacity-0" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                    {char}
                                </span>
                            ))}
                        </span>
                    </div>
                    <div className="sentence flex items-center justify-center gap-[0.2em] flex-nowrap whitespace-nowrap">
                        <span className="big-word inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                            {t("hero.technology").split("").map((char, i) => (
                                <span key={`t1${i}`} className="next-char inline-block opacity-0" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                    {char}
                                </span>
                            ))}
                        </span>
                        <span className="big-word inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                            {t("hero.driven_by").split("").map((char, i) => (
                                <span key={`n2${i}`} className="next-char inline-block opacity-0" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                    {char}
                                </span>
                            ))}
                        </span>
                        <span className="big-word font-bold inline-block whitespace-nowrap" style={{ opacity: 1 }}>
                            {t("hero.innovation").split("").map((char, i) => (
                                <span key={`b2${i}`} className="next-char inline-block opacity-0" style={{ whiteSpace: char === " " ? "pre" : "normal" }}>
                                    {char}
                                </span>
                            ))}
                        </span>
                    </div>
                </h1>
                <p
                    className="hero-desc-style final-subtitle mt-3 sm:mt-4 lg:mt-5 text-black/90 text-center mx-auto max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl will-change-[opacity,transform] opacity-0 translate-y-4"
                >
                    {t("hero.about_desc")}
                </p>
            </div>
        </div>
    );
}
