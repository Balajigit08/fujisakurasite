"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

import { FaStar } from "react-icons/fa";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CareerHeader from "./header/page";
import BrandLoader from "@/app/components/BrandLoader/BrandLoader";
import Button from "@/app/components/common/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getJobsData, getCachedJobsData } from "@/lib/jobsCache";

if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP);
}

export default function CareerPage() {
    const { t } = useLanguage();
    const containerRef = useRef(null);
    const [jobs, setJobs] = useState(() => getCachedJobsData() || []);
    const [loading, setLoading] = useState(() => !getCachedJobsData());
    const [error, setError] = useState(null);

    useEffect(() => {
        getJobsData()
            .then((data) => setJobs(data || []))
            .catch(() => setError("Failed to load jobs. Please try again later."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading) {
            const t1 = setTimeout(() => {
                if (typeof window !== "undefined" && window.lenis) {
                    window.lenis.resize();
                }
            }, 100);
            const t2 = setTimeout(() => {
                if (typeof window !== "undefined" && window.lenis) {
                    window.lenis.resize();
                }
            }, 500);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [loading]);

    useGSAP(() => {
        if (jobs.length > 0) {
            gsap.fromTo(".job-card",
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out", clearProps: "transform" }
            );
        }
    }, { scope: containerRef, dependencies: [jobs] });

    return (
        <main ref={containerRef} data-navbar="light" className="overflow-x-hidden w-full max-w-[2050px] mx-auto min-h-screen flex flex-col font-sans bg-white">
            <CareerHeader />

            <div className="bg-[#EDF6FA] flex-grow py-10 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[1800px] mx-auto">
                    <div className="mb-6 sm:mb-10">
                        <h1 className="text-3xl sm:text-4xl md:text-[clamp(2.25rem,3vw,3.75rem)] font-bold text-[#2d3a53] leading-tight">{t("career.career_opportunities")}</h1>
                        <p className="mt-2.5 text-[#8e9db0] text-base sm:text-lg md:text-[clamp(1.15rem,1.4vw,1.6rem)] leading-relaxed">{t("career.find_dream_job")}</p>
                    </div>

                    {loading && (
                        <BrandLoader targetProgress={100} label={t("career.loading")} />
                    )}

                    {!loading && error && (
                        <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm my-4">
                            <p className="text-red-500 text-base sm:text-lg">{error}</p>
                        </div>
                    )}

                    {!loading && !error && jobs.length === 0 && (
                        <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm my-4">
                            <h3 className="text-xl sm:text-2xl md:text-[clamp(1.5rem,1.8vw,2.25rem)] font-bold text-[#2d3a53]">{t("career.no_openings_title")}</h3>
                            <p className="mt-2.5 text-[#8e9db0] text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.35rem)]">
                                {t("career.no_openings_desc")}
                            </p>
                        </div>
                    )}

                    {!loading && !error && jobs.length > 0 && (
                        <div className="flex flex-col gap-6 justify-between">
                            {jobs.map((job) => {
                                const notes = job.notes || (Array.isArray(job.languages) && job.languages.length > 0
                                    ? job.languages.join(", ")
                                    : "N/A");
                                const imageUrl = job.image_url
                                    ? (job.image_url.startsWith("job-images/") ? `/api/images/${job.image_url}` : job.image_url)
                                    : (job.image || "/FS-images/fuji-logo.png");
                                const employmentType = job.employment_type || job.type || "Full Time";
                                const noticePeriod = job.notice_period || job.noticePeriod || "30 Days";

                                return (
                                    <div key={job.id} className="job-card opacity-0 group relative w-full border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                                        {job.is_featured ? (
                                            <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
                                                <svg viewBox="0 0 100 100" className="w-full h-full text-[#d4daf4] group-hover:text-[#556ee6] transition-colors duration-300 fill-current">
                                                    <polygon points="0,0 100,0 0,100" />
                                                </svg>
                                                <div className="absolute top-2 left-2 text-white">
                                                    <FaStar size={13} />
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className="flex flex-col md:flex-row md:items-center p-6 pl-10 md:pl-12 lg:pr-12 gap-6 lg:gap-12 justify-between">
                                            <div className="w-18 h-18 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 overflow-hidden p-1.5 shadow-xs">
                                                <Image quality={100}
                                                    src={imageUrl}
                                                    alt={job.title}
                                                    width={96}
                                                    height={96}
                                                    unoptimized
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>

                                            <div className="flex flex-col flex-1 min-w-[200px]">
                                                <h3 className="text-lg sm:text-xl md:text-[clamp(1.35rem,1.75vw,2.15rem)] font-bold text-[#2d3a53] leading-snug">{job.title}</h3>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 w-full md:w-auto shrink-0">
                                                <div className="text-[#2d3a53] text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold">
                                                    {t("career.experience")} : <span className="text-[#8e9db0] ml-1 font-medium">{job.experience || "1 - 2 years"}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 w-full md:w-auto shrink-0">
                                                <div className="text-[#8e9db0] text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                                                    {employmentType.toLowerCase() === "full time"
                                                        ? t("career.full_time")
                                                        : employmentType.toLowerCase() === "part time"
                                                        ? t("career.part_time")
                                                        : employmentType}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#fcfdff] border-t border-gray-100 px-6 md:px-12 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="text-[#2d3a53] text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.35rem)] font-semibold">
                                                {t("career.notice_period")} : <span className="text-[#8e9db0] ml-1 font-medium">{noticePeriod}</span>
                                            </div>
                                            <div className="text-[#2d3a53] text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.35rem)] font-semibold">
                                                {t("career.notes")} : <span className="text-[#8e9db0] ml-1 font-medium">{notes}</span>
                                            </div>
                                            <Button
                                                href={`/career/${job.id}`}
                                                className="px-7 sm:px-9 py-2.5 sm:py-3 text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.35rem)] font-semibold self-start md:self-auto shadow-sm"
                                            >
                                                <span>{t("career.apply_now")}</span>
                                                <span className="text-lg ml-1 leading-none">&raquo;</span>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
