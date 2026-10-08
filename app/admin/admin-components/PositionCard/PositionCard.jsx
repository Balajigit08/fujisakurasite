"use client";

import Image from "next/image";
import { FaStar, FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { MdPause, MdPlayArrow } from "react-icons/md";
import Button from "@/app/components/common/Button";

export default function PositionCard({ job = {}, onEdit, onDelete, onPreview, onToggleStatus } = {}) {
    const employmentType = job.employment_type || job.type || "Full Time";
    const noticePeriod = job.notice_period || job.noticePeriod || "30 Days";
    const imageUrl = job.image_url ? (job.image_url.startsWith("job-images/") ? `/api/images/${job.image_url}` : job.image_url) : (job.image || "/FS-images/Logo-fs.png");
    const notes = job.notes || (Array.isArray(job.languages) && job.languages.length > 0 ? job.languages.join(", ") : "N/A");

    return (
        <div className={`group relative w-full border rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${!job.is_active ? "border-gray-200 opacity-70" : "border-gray-200"}`}>
            {!job.is_active && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300" />
            )}

            {job.is_featured && job.is_active && (
                <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none z-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#d4daf4] group-hover:text-[#556ee6] transition-colors duration-300 fill-current">
                        <polygon points="0,0 100,0 0,100" />
                    </svg>
                    <div className="absolute top-1.5 left-1.5 text-white">
                        <FaStar size={11} />
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center p-6 pl-10 md:pl-12 lg:pr-12 gap-6 lg:gap-10 justify-between">
                <div className="w-18 h-18 sm:w-22 sm:h-22 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden p-2.5 shadow-xs">
                    <Image
                        src={imageUrl || "/FS-images/Logo-fs.png"}
                        alt={job.title}
                        width={88}
                        height={88}
                        unoptimized
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl sm:text-2xl md:text-[clamp(1.35rem,1.65vw,2rem)] font-bold text-[#2d3a53] truncate">{job.title}</h3>
                        {job.is_active !== undefined && (
                            <span className={`shrink-0 text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${job.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                                {job.is_active ? "Active" : "Inactive"}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-[#2d3a53] text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.35rem)] font-semibold">
                    <div>
                        Experience : <span className="text-[#8e9db0] ml-1">{job.experience || "1 - 2 years"}</span>
                    </div>
                    <div className="text-[#8e9db0]">
                        {employmentType}
                    </div>
                </div>
            </div>

            <div className="bg-[#fcfdff] px-6 md:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-5 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-6 text-[#2d3a53] text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.35rem)] font-semibold">
                    <div>
                        Notice-Period : <span className="text-[#8e9db0] ml-1">{noticePeriod}</span>
                    </div>
                    <div>
                        Language Proficiency : <span className="text-[#8e9db0] ml-1">{notes}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                    {onToggleStatus && (
                        <button
                            type="button"
                            onClick={() => onToggleStatus(job)}
                            title={job.is_active ? "Deactivate" : "Activate"}
                            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.2rem)] transition-colors cursor-pointer ${job.is_active ? "hover:bg-amber-50 text-amber-600" : "hover:bg-emerald-50 text-emerald-600"}`}
                        >
                            {job.is_active ? <MdPause size={17} /> : <MdPlayArrow size={17} />}
                            <span>{job.is_active ? "Deactivate" : "Activate"}</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onEdit(job)}
                        disabled={!job.is_active}
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 hover:bg-blue-50 text-[#556ee6] font-bold text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.2rem)] rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title={job.is_active ? "Edit Position" : "Cannot edit an inactive position"}
                    >
                        <FaPencilAlt size={15} />
                        <span>Edit</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(job.id)}
                        disabled={!job.is_active}
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 hover:bg-red-50 text-red-600 font-bold text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.2rem)] rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title={job.is_active ? "Delete Position" : "Cannot delete an inactive position"}
                    >
                        <FaTrashAlt size={15} />
                        <span>Delete</span>
                    </button>
                    <Button
                        onClick={() => onPreview(job)}
                        size="sm"
                        className="text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.2rem)] font-bold px-6 py-2.5 sm:py-3 shadow-xs"
                        title="Preview Position"
                    >
                        <span>Preview</span>
                        <span className="text-lg leading-none">&raquo;</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
