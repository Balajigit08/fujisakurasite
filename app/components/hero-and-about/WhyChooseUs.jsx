import React, { useMemo } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const projectImageUrls = {
    industry_expertise: "/FS-images/industry_expertise.jpg",
    "proven-experience": "/FS-images/proven-experience.jpg",
    billingual: "/FS-images/billingual.jpg",
    "japanese-training": "/FS-images/japanese-training.jpg",
};

export default function WhyChooseUs() {
    const { t, lang } = useLanguage();

    const projectsData = useMemo(() => [
        { id: 1, title: t("hero.project_1_title"), desc: t("hero.project_1_desc"), category: t("hero.project_1_category"), imgSrc: "industry_expertise" },
        { id: 2, title: t("hero.project_2_title"), desc: t("hero.project_2_desc"), category: t("hero.project_2_category"), imgSrc: "proven-experience" },
        { id: 3, title: t("hero.project_3_title"), desc: t("hero.project_3_desc"), category: t("hero.project_3_category"), imgSrc: "billingual" },
        { id: 4, title: t("hero.project_4_title"), desc: t("hero.project_4_desc"), category: t("hero.project_4_category"), imgSrc: "japanese-training" },
    ], [t]);

    return (
        <div id="projects-wrapper" className="absolute inset-0 z-[20] overflow-hidden flex items-center bg-[#071036] opacity-0 pointer-events-none">
            {/* Dynamic Background Images */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {projectsData.map((project, index) => (
                    <div key={`bg-${index}`} className={`project-bg-${index} absolute inset-0 opacity-0 pointer-events-none`}>
                        <Image quality={100} src={projectImageUrls[project.imgSrc] || project.imgSrc} alt="" fill sizes="100vw" className="object-cover object-center" />
                        <div className="absolute inset-0 bg-black/60 z-10" />
                    </div>
                ))}
            </div>

            {/* Left Fixed Intro Text */}
            <div className="intro-text-fixed absolute left-[clamp(1.5rem,3.5vw,3.5rem)] top-1/2 -translate-y-1/2 z-10 w-[clamp(55%,58vw,880px)] text-white font-medium drop-shadow-md will-change-transform mt-10 opacity-0" style={{ opacity: 0 }}>
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

            {/* Horizontal Track of Cards */}
            <div className="horizontal-track flex flex-row items-center h-full pl-[clamp(850px,72vw,1180px)] gap-[clamp(200px,20vw,360px)] py-10 md:py-14 will-change-transform mt-10 relative z-10" style={{ width: "max-content" }}>
                {projectsData.map((project) => (
                    <div key={project.id} className="project-card group flex flex-col w-[clamp(300px,26vw,460px)] h-[clamp(400px,32vw,580px)] flex-shrink-0 cursor-pointer shadow-2xl mt-0 overflow-hidden rounded-tl-[clamp(30px,3vw,40px)] rounded-br-[clamp(30px,3vw,40px)] opacity-0" style={{ opacity: 0 }}>
                        <div className="w-full h-1/2 flex-1 overflow-hidden bg-gray-900 relative">
                            <Image quality={100} src={projectImageUrls[project.imgSrc] || project.imgSrc} alt={project.title} fill sizes="(max-width: 1024px) 100vw, 460px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                        </div>
                        <div className="p-5 md:p-6 flex flex-col justify-between h-1/2 flex-1 bg-white group-hover:bg-[#9BE7FF] transition-colors duration-500">
                            <div>
                                <h3 className="text-[clamp(1.5rem,2.5vw,3rem)] font-bold mb-[clamp(0.2rem,0.4vw,0.4rem)] tracking-tight text-black transition-colors duration-500 leading-tight">
                                    {project.title}
                                </h3>
                                <div className="text-[clamp(14px,1.35vw,22px)] font-bold text-gray-800 transition-colors duration-500 mb-[clamp(0.35rem,0.6vw,0.6rem)] whitespace-nowrap">
                                    {project.category}
                                </div>
                                <p className="text-[clamp(13px,1.3vw,20px)] text-gray-600 transition-colors duration-500 leading-relaxed line-clamp-4">
                                    {project.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
