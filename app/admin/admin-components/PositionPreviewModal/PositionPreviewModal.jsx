"use client";

import { useEffect } from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";

export default function PositionPreviewModal({ previewPosition, onClose, onEdit }) {
    useEffect(() => {
        if (!previewPosition) return;

        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        if (typeof window !== "undefined" && window.lenis) {
            window.lenis.stop();
        }

        const mainContent = document.getElementById("admin-main-content");
        if (mainContent) mainContent.inert = true;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            window.removeEventListener("keydown", handleKeyDown);

            if (mainContent) mainContent.inert = false;

            if (typeof window !== "undefined" && window.lenis) {
                window.lenis.start();
            }
        };
    }, [previewPosition, onClose]);

    if (!previewPosition) return null;

    const imageUrl = previewPosition.image_url
        ? (previewPosition.image_url.startsWith("job-images/")
            ? `/api/images/${previewPosition.image_url}`
            : previewPosition.image_url)
        : (previewPosition.image || "/FS-images/Logo-fs.png");

    const employmentType = previewPosition.employment_type || previewPosition.type || "Full Time";
    const noticePeriod = previewPosition.notice_period || previewPosition.noticePeriod || "30 Days";
    const languagesStr = Array.isArray(previewPosition.languages) && previewPosition.languages.length > 0
        ? previewPosition.languages.join(", ")
        : (previewPosition.notes || "N/A");

    return (
        <div
            onClick={onClose}
            onWheel={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Position Details Preview"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overscroll-contain animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="relative shrink-0 px-5 py-4 sm:px-8 sm:py-5 border-b border-gray-100 bg-white flex items-center justify-between">
                    <div className="pr-10">
                        <h2 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.7vw,2rem)] font-bold text-[#1B1B1B]">
                            Position Details Preview
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm md:text-[clamp(0.9rem,1vw,1.1rem)] text-gray-500">
                            Review the position information before publishing.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        title="Close Modal"
                        aria-label="Close"
                        className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-lg"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div
                    data-lenis-prevent="true"
                    data-lenis-prevent-wheel="true"
                    data-lenis-prevent-touch="true"
                    onWheel={(e) => e.stopPropagation()}
                    className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7"
                >
                    <div className="space-y-6">
                        {/* Position Summary */}
                        <div className="bg-[#EDF6FA] border border-[#34CBEA]/30 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-16 h-16 sm:w-18 sm:h-18 shrink-0 rounded-2xl bg-white border border-gray-200 p-2 flex items-center justify-center overflow-hidden shadow-xs">
                                    <Image quality={100}
                                        src={imageUrl}
                                        alt={previewPosition.title}
                                        width={72}
                                        height={72}
                                        unoptimized
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-xl sm:text-2xl md:text-[clamp(1.35rem,1.65vw,2.1rem)] font-bold text-[#1B1B1B] break-words">
                                        {previewPosition.title}
                                    </h3>
                                    <p className="mt-1 text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] text-gray-600 font-medium">
                                        {previewPosition.company || "FujiSakura Technologies"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-blue-200 text-[#556ee6] text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold shadow-xs">
                                    {employmentType}
                                </span>
                                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold shadow-xs">
                                    Exp: {previewPosition.experience || "1 - 2 years"}
                                </span>
                            </div>
                        </div>

                        {/* Section Title */}
                        <div className="pb-3 border-b border-gray-100">
                            <h3 className="text-lg sm:text-xl md:text-[clamp(1.25rem,1.5vw,1.75rem)] font-bold text-[#1B1B1B]">
                                Job Details &amp; Overview
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm md:text-[clamp(0.9rem,1vw,1.1rem)] text-gray-500">
                                Key information about this position.
                            </p>
                        </div>

                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                                <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 uppercase tracking-wider">
                                    Notice Period
                                </p>
                                <p className="mt-2 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] font-semibold text-[#2d3a53] break-words">
                                    {noticePeriod || "—"}
                                </p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                                <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 uppercase tracking-wider">
                                    Location
                                </p>
                                <p className="mt-2 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] font-semibold text-[#2d3a53] break-words">
                                    {previewPosition.location || "Chennai"}
                                </p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                                <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 uppercase tracking-wider">
                                    Languages / Notes
                                </p>
                                <p
                                    className="mt-2 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] font-semibold text-[#2d3a53] break-words [overflow-wrap:anywhere]"
                                    title={languagesStr}
                                >
                                    {languagesStr || "—"}
                                </p>
                            </div>
                        </div>

                        {/* Required Languages */}
                        {Array.isArray(previewPosition.languages) && previewPosition.languages.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                                <h4 className="text-base sm:text-lg md:text-[clamp(1.15rem,1.35vw,1.5rem)] font-bold text-[#2d3a53] mb-3">
                                    Required Languages
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {previewPosition.languages.map((lang, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold"
                                        >
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Job Description */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
                            <h4 className="text-base sm:text-lg md:text-[clamp(1.15rem,1.35vw,1.5rem)] font-bold text-[#2d3a53] mb-3">
                                Job Description
                            </h4>
                            <p className="text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] text-gray-700 leading-relaxed whitespace-pre-line break-words">
                                {previewPosition.description || "No description provided."}
                            </p>
                        </div>

                        {/* Responsibilities */}
                        {Array.isArray(previewPosition.responsibilities) && previewPosition.responsibilities.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
                                <h4 className="text-base sm:text-lg md:text-[clamp(1.15rem,1.35vw,1.5rem)] font-bold text-[#2d3a53] mb-3">
                                    Key Responsibilities
                                </h4>
                                <ul className="space-y-3 pl-5 list-disc text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] text-gray-700">
                                    {previewPosition.responsibilities.map((resp, idx) => (
                                        <li key={idx} className="leading-relaxed break-words">
                                            {resp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Required Skills */}
                        {((Array.isArray(previewPosition.required_skills) && previewPosition.required_skills.length > 0) ||
                            (Array.isArray(previewPosition.requiredSkills) && previewPosition.requiredSkills.length > 0)) && (
                                <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
                                    <h4 className="text-base sm:text-lg md:text-[clamp(1.15rem,1.35vw,1.5rem)] font-bold text-[#2d3a53] mb-3">
                                        Required Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {(Array.isArray(previewPosition.required_skills) && previewPosition.required_skills.length > 0
                                            ? previewPosition.required_skills
                                            : previewPosition.requiredSkills
                                        ).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-blue-50 text-[#556ee6] border border-blue-200 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Footer Button */}
                        <div className="pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-7 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.15rem)] font-bold transition-colors cursor-pointer"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
