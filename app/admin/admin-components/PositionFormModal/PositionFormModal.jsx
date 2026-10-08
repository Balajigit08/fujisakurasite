"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaTimes, FaUpload, FaPlus, FaTrashAlt } from "react-icons/fa";
import Button from "@/app/components/common/Button";

const LANGUAGE_OPTIONS = ["English", "Japanese", "Tamil", "Hindi"];
const EMPLOYMENT_TYPES = ["Full Time", "Part Time"];
const NOTICE_PERIODS = ["Immediate", "15 Days", "30 Days", "60 Days", "90 Days"];

// Character limits
const LIMIT_ROLE_NAME = 100;
const LIMIT_JOB_DESC = 200;
const LIMIT_RESPONSIBILITY = 200;
const LIMIT_LANGUAGE = 50;
const LIMIT_SKILL = 50;

function getInitialFormData(editingPosition) {
    if (editingPosition) {
        return {
            roleName: editingPosition.title || "",
            experience: editingPosition.experience || "",
            employmentType: editingPosition.employment_type || "Full Time",
            noticePeriod: editingPosition.notice_period || "30 Days",
            languages: Array.isArray(editingPosition.languages) && editingPosition.languages.length > 0
                ? [...editingPosition.languages]
                : (editingPosition.notes ? editingPosition.notes.split(",").map(s => s.trim()).filter(Boolean) : ["English"]),
            customLanguage: "",
            jobDescription: editingPosition.description || "",
            responsibilities: Array.isArray(editingPosition.responsibilities) && editingPosition.responsibilities.length > 0
                ? [...editingPosition.responsibilities]
                : ["Develop and maintain web applications."],
            requiredSkills: Array.isArray(editingPosition.required_skills) && editingPosition.required_skills.length > 0
                ? [...editingPosition.required_skills]
                : (Array.isArray(editingPosition.requiredSkills) ? [...editingPosition.requiredSkills] : []),
            customSkill: "",
            image: editingPosition.image_url || editingPosition.image || ""
        };
    }
    return {
        roleName: "",
        experience: "",
        employmentType: "Full Time",
        noticePeriod: "30 Days",
        languages: [],
        customLanguage: "",
        jobDescription: "We are looking for a dedicated professional to join our engineering team. You will collaborate with cross-functional teams to design, develop, and deliver high quality software solutions.",
        responsibilities: [
            "Develop and maintain web applications.",
            "Collaborate with the design team.",
            "Optimize application performance.",
            "Fix bugs and improve existing features."
        ],
        requiredSkills: [],
        customSkill: "",
        image: ""
    };
}

export default function PositionFormModal({ isOpen, onClose, onSave, editingPosition, saving = false }) {
    const fileInputRef = useRef(null);
    const [imageError, setImageError] = useState("");
    const [imageUploading, setImageUploading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset local saving state when parent signals completion
    useEffect(() => {
        if (!saving) setIsSaving(false);
    }, [saving]);

    const [formData, setFormData] = useState(() => getInitialFormData(editingPosition));

    // Always reset form state to fresh initial copy when modal opens or editing position changes
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData(editingPosition));
            setValidationErrors({});
            setImageError("");
            setIsSaving(false);
        }
    }, [isOpen, editingPosition]);

    useEffect(() => {
        if (!isOpen) return;

        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        if (typeof window !== "undefined" && window.lenis) {
            window.lenis.stop();
        }

        // Mark all sibling page content as inert so background elements
        // cannot be clicked, focused, or reached via keyboard while modal is open.
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
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        setImageError("");
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
            setImageError("Invalid file type. Please upload JPG, PNG, WEBP, SVG, or GIF.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageError("File size exceeds 5 MB.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setImageUploading(true);
        try {
            const fd = new FormData();
            fd.append("image", file);
            const res = await fetch("/api/admin/jobs/image", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) {
                setImageError(data.error || "Image upload failed.");
                return;
            }
            setFormData((prev) => ({ ...prev, image: data.image_url }));
        } catch {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        } finally {
            setImageUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: "" }));
        setImageError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveLanguage = (langToRemove) => {
        setFormData((prev) => ({
            ...prev,
            languages: (prev.languages || []).filter((l) => l !== langToRemove)
        }));
    };

    const handleAddCustomLanguage = () => {
        if (!formData.customLanguage.trim()) return;
        const newLang = formData.customLanguage.trim();
        if (!formData.languages.includes(newLang)) {
            setFormData((prev) => ({
                ...prev,
                languages: [...prev.languages, newLang],
                customLanguage: ""
            }));
        } else {
            setFormData((prev) => ({ ...prev, customLanguage: "" }));
        }
        if (validationErrors.languages) setValidationErrors((prev) => ({ ...prev, languages: "" }));
    };

    const handleResponsibilityChange = (index, value) => {
        const updated = [...formData.responsibilities];
        updated[index] = value;
        setFormData((prev) => ({ ...prev, responsibilities: updated }));
        if (validationErrors.responsibilities) setValidationErrors((prev) => ({ ...prev, responsibilities: "" }));
    };

    const handleAddResponsibility = () => {
        setFormData((prev) => ({
            ...prev,
            responsibilities: [...prev.responsibilities, ""]
        }));
    };

    const handleRemoveResponsibility = (index) => {
        setFormData((prev) => {
            const updated = prev.responsibilities.filter((_, i) => i !== index);
            return {
                ...prev,
                responsibilities: updated.length > 0 ? updated : [""]
            };
        });
    };

    const handleAddCustomSkill = () => {
        if (!formData.customSkill || !formData.customSkill.trim()) return;
        const newSkill = formData.customSkill.trim();
        if (!formData.requiredSkills.includes(newSkill)) {
            setFormData((prev) => ({
                ...prev,
                requiredSkills: [...prev.requiredSkills, newSkill],
                customSkill: ""
            }));
        } else {
            setFormData((prev) => ({ ...prev, customSkill: "" }));
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData((prev) => ({
            ...prev,
            requiredSkills: (prev.requiredSkills || []).filter((s) => s !== skillToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = {};

        if (!formData.roleName.trim()) {
            errors.roleName = "Role name is required.";
        } else if (formData.roleName.trim().length >= LIMIT_ROLE_NAME) {
            errors.roleName = `Role name must be under ${LIMIT_ROLE_NAME} characters.`;
        }

        if (!formData.jobDescription.trim()) {
            errors.jobDescription = "Job description is required.";
        } else if (formData.jobDescription.trim().length >= LIMIT_JOB_DESC) {
            errors.jobDescription = `Job description must be under ${LIMIT_JOB_DESC} characters.`;
        }

        const validResponsibilities = formData.responsibilities.filter((r) => r.trim().length > 0);
        if (validResponsibilities.length === 0) {
            errors.responsibilities = "At least one key responsibility is required.";
        } else if (validResponsibilities.some((r) => r.trim().length > LIMIT_RESPONSIBILITY)) {
            errors.responsibilities = `Each responsibility must be ${LIMIT_RESPONSIBILITY} characters or fewer.`;
        }

        if (!formData.languages || formData.languages.length === 0) {
            errors.languages = "At least one required language must be added.";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsSaving(true);
        onSave({
            title: formData.roleName.trim(),
            experience: formData.experience,
            employment_type: formData.employmentType,
            notice_period: formData.noticePeriod,
            languages: formData.languages,
            description: formData.jobDescription.trim(),
            responsibilities: validResponsibilities,
            required_skills: formData.requiredSkills || [],
            image_url: formData.image || null,
            is_featured: 1,
        });
    };

    return (

        <div
            onClick={onClose}
            onWheel={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={editingPosition ? "Edit Position" : "Add Position"}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/60
        backdrop-blur-sm
        p-4
        sm:p-6
        overscroll-contain
        animate-in
        fade-in
        duration-200
    "
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="
            relative
            w-full
            max-w-6xl
            bg-white
            rounded-2xl
            border
            border-gray-200
            shadow-2xl
            overflow-hidden
            max-h-[92vh]
            flex
            flex-col
            animate-in
            fade-in
            zoom-in-95
            duration-200
        "
            >
                <div
                    className="
                relative
                shrink-0
                px-5
                py-4
                sm:px-8
                sm:py-5
                border-b
                border-gray-100
                bg-white
                flex
                items-center
                justify-between
            "
                >
                    <div className="pr-10">
                        <h2 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.7vw,2rem)] font-bold text-[#2d3a53]">
                            {editingPosition ? "Edit Position" : "Add Position"}
                        </h2>

                        <p className="mt-1 text-xs sm:text-sm md:text-[clamp(0.9rem,1vw,1.1rem)] text-gray-500">
                            {editingPosition
                                ? "Update the position information and requirements."
                                : "Add a new position with its requirements and responsibilities."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        title="Close Modal"
                        aria-label="Close"
                        className="
                    absolute
                    top-4
                    right-4
                    sm:top-5
                    sm:right-5
                    w-9
                    h-9
                    flex
                    items-center
                    justify-center
                    rounded-full
                    text-gray-400
                    hover:text-gray-700
                    hover:bg-gray-100
                    transition-colors
                    cursor-pointer
                    text-lg
                "
                    >
                        <FaTimes size={18} />
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit}
                    data-lenis-prevent="true"
                    data-lenis-prevent-wheel="true"
                    data-lenis-prevent-touch="true"
                    onWheel={(e) => e.stopPropagation()}
                    className="
                flex-1
                overflow-y-auto
                px-5
                py-5
                sm:px-8
                sm:py-7
                space-y-8
            "
                >

                    <section>
                        <div className="mb-5 pb-3 border-b border-gray-100">
                            <h3 className="text-lg sm:text-xl md:text-[clamp(1.2rem,1.4vw,1.6rem)] font-bold text-[#1B1B1B]">
                                Position Information
                            </h3>

                            <p className="mt-1 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-gray-500">
                                Provide the basic information for this position.
                            </p>
                        </div>

                        <div className="space-y-6">

                            {/* Position Image */}
                            <div>
                                <label className="block text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53] mb-2">
                                    Position Image
                                </label>

                                <div
                                    className="
                                flex
                                flex-col
                                sm:flex-row
                                items-center
                                sm:items-start
                                gap-4
                                sm:gap-5
                            "
                                >
                                    {/* Image Preview */}
                                    <div
                                        className="
                                    w-24
                                    h-24
                                    sm:w-28
                                    sm:h-28
                                    shrink-0
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    flex
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    p-2
                                "
                                    >
                                        {imageUploading ? (
                                            <div
                                                className="
                                            h-6
                                            w-6
                                            animate-spin
                                            rounded-full
                                            border-2
                                            border-gray-200
                                            border-t-[#556ee6]
                                        "
                                            />
                                        ) : formData.image ? (
                                            <Image
                                                src={
                                                    formData.image.startsWith("job-images/")
                                                        ? `/api/images/${formData.image}`
                                                        : formData.image
                                                }
                                                alt="Position Preview"
                                                width={64}
                                                height={64}
                                                unoptimized
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-xs font-medium text-gray-400">
                                                No Image
                                            </span>
                                        )}
                                    </div>

                                    {/* Upload Controls */}
                                    <div className="flex-1 w-full">
                                        <div
                                            className="
                                        flex
                                        flex-wrap
                                        items-center
                                        justify-center
                                        sm:justify-start
                                        gap-2
                                    "
                                        >
                                            <label
                                                className="
                                            inline-flex
                                            items-center
                                            justify-center
                                            gap-2
                                            px-4
                                            py-2.5
                                            rounded-xl
                                            border
                                            border-gray-300
                                            bg-white
                                            text-gray-700
                                            text-xs
                                            sm:text-sm
                                            font-medium
                                            hover:bg-gray-50
                                            transition-colors
                                            cursor-pointer
                                        "
                                            >
                                                <FaUpload size={13} />

                                                <span>
                                                    {imageUploading
                                                        ? "Uploading…"
                                                        : formData.image
                                                            ? "Replace Image"
                                                            : "Choose File"}
                                                </span>

                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                                                    onChange={handleImageUpload}
                                                    disabled={imageUploading}
                                                    className="hidden"
                                                />
                                            </label>

                                            {formData.image && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="
                                                inline-flex
                                                items-center
                                                justify-center
                                                px-4
                                                py-2.5
                                                rounded-xl
                                                border
                                                border-red-200
                                                text-red-600
                                                hover:bg-red-50
                                                text-xs
                                                sm:text-sm
                                                font-medium
                                                transition-colors
                                                cursor-pointer
                                            "
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <p className="mt-2 text-xs text-gray-500 text-center sm:text-left">
                                            Supports JPG, PNG, WEBP, SVG and GIF up to 5MB.
                                        </p>

                                        {imageError && (
                                            <p className="mt-1 text-xs text-red-600 text-center sm:text-left">
                                                {imageError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Role Name */}
                            <div>
                                <label className="block text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53] mb-2">
                                    Role Name <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={formData.roleName}
                                    maxLength={LIMIT_ROLE_NAME}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            roleName: e.target.value,
                                        });

                                        if (e.target.value.length >= LIMIT_ROLE_NAME) {
                                            setValidationErrors((prev) => ({
                                                ...prev,
                                                roleName: `Role name must be under ${LIMIT_ROLE_NAME} characters.`,
                                            }));
                                        } else if (validationErrors.roleName) {
                                            setValidationErrors((prev) => ({
                                                ...prev,
                                                roleName: "",
                                            }));
                                        }
                                    }}
                                    placeholder="e.g. Bilingual Developer"
                                    className={`
                                w-full
                                px-4
                                py-3
                                sm:px-5
                                sm:py-3.5
                                rounded-xl
                                border
                                text-base
                                sm:text-lg
                                md:text-[clamp(1rem,1.15vw,1.25rem)]
                                text-[#2d3a53]
                                bg-white
                                focus:outline-none
                                focus:ring-1
                                focus:ring-[#34CBEA]/10
                                focus:border-[#34CBEA]
                                transition
                                ${validationErrors.roleName ||
                                            formData.roleName.length >= LIMIT_ROLE_NAME
                                            ? "border-red-500 bg-red-50/20"
                                            : "border-gray-300"
                                        }
                            `}
                                />

                                {validationErrors.roleName && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                                        {validationErrors.roleName}
                                    </p>
                                )}
                            </div>

                            {/* Experience / Employment / Notice */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                                {/* Experience */}
                                <div>
                                    <label className="block text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53] mb-2">
                                        Experience
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.experience}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                experience: e.target.value.replace(/[a-zA-Z]/g, ""),
                                            })
                                        }
                                        placeholder="e.g. 1 - 2 or 3+"
                                        className="
                                    w-full
                                    px-4
                                    py-3
                                    sm:px-5
                                    sm:py-3.5
                                    rounded-xl
                                    border
                                    border-gray-300
                                    text-base
                                    sm:text-lg
                                    md:text-[clamp(1rem,1.15vw,1.25rem)]
                                    text-[#2d3a53]
                                    bg-white
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[#34CBEA]/10
                                    focus:border-[#34CBEA]
                                    transition
                                "
                                    />
                                </div>

                                {/* Employment Type */}
                                <div>
                                    <label className="block text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53] mb-2">
                                        Employment Type
                                    </label>

                                    <select
                                        value={formData.employmentType}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                employmentType: e.target.value,
                                            })
                                        }
                                        className="
                                    w-full
                                    px-4
                                    py-3
                                    sm:px-5
                                    sm:py-3.5
                                    rounded-xl
                                    border
                                    border-gray-300
                                    text-base
                                    sm:text-lg
                                    md:text-[clamp(1rem,1.15vw,1.25rem)]
                                    text-[#2d3a53]
                                    bg-white
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[#34CBEA]/10
                                    focus:border-[#34CBEA]
                                    cursor-pointer
                                "
                                    >
                                        {EMPLOYMENT_TYPES.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Notice Period */}
                                <div>
                                    <label className="block text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53] mb-2">
                                        Notice Period
                                    </label>

                                    <select
                                        value={formData.noticePeriod}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                noticePeriod: e.target.value,
                                            })
                                        }
                                        className="
                                    w-full
                                    px-4
                                    py-3
                                    sm:px-5
                                    sm:py-3.5
                                    rounded-xl
                                    border
                                    border-gray-300
                                    text-base
                                    sm:text-lg
                                    md:text-[clamp(1rem,1.15vw,1.25rem)]
                                    text-[#2d3a53]
                                    bg-white
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[#34CBEA]/10
                                    focus:border-[#34CBEA]
                                    cursor-pointer
                                "
                                    >
                                        {NOTICE_PERIODS.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Required Languages */}
                            <div>
                                <label className="block text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53] mb-2">
                                    Required Languages{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                {formData.languages?.length > 0 && (
                                    <div className="flex flex-wrap gap-2.5 mb-3">
                                        {formData.languages.map((lang, index) => (
                                            <div
                                                key={`${lang}-${index}`}
                                                className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            px-3.5
                                            py-1.5
                                            rounded-full
                                            bg-emerald-50
                                            text-emerald-600
                                            border
                                            border-emerald-200
                                            text-xs
                                            sm:text-sm
                                            md:text-[clamp(0.85rem,0.95vw,1.05rem)]
                                            font-bold
                                        "
                                            >
                                                <span>{lang}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveLanguage(lang)
                                                    }
                                                    title={`Remove ${lang}`}
                                                    className="
                                                p-0.5
                                                rounded-full
                                                hover:bg-white/50
                                                transition-colors
                                                cursor-pointer
                                            "
                                                >
                                                    <FaTimes size={11} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-2.5 w-full sm:max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Type language and click Add..."
                                        value={formData.customLanguage}
                                        maxLength={LIMIT_LANGUAGE}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customLanguage: e.target.value,
                                            })
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddCustomLanguage();
                                            }
                                        }}
                                        className={`
                                    flex-1
                                    min-w-0
                                    px-4
                                    py-3
                                    rounded-xl
                                    border
                                    text-base
                                    sm:text-lg
                                    md:text-[clamp(0.95rem,1.1vw,1.2rem)]
                                    text-[#2d3a53]
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[#34CBEA]/10
                                    focus:border-[#34CBEA]
                                    ${formData.customLanguage.length >=
                                                LIMIT_LANGUAGE
                                                ? "border-red-400"
                                                : "border-gray-300"
                                            }
                                `}
                                    />

                                    <Button
                                        type="button"
                                        onClick={handleAddCustomLanguage}
                                        size="sm"
                                        className="shrink-0 text-sm sm:text-base font-bold px-5 py-3"
                                    >
                                        Add
                                    </Button>
                                </div>

                                {formData.customLanguage.length >= LIMIT_LANGUAGE && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                                        Language name must be under {LIMIT_LANGUAGE} characters.
                                    </p>
                                )}

                                {validationErrors.languages && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                                        {validationErrors.languages}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>


                    <section>
                        <div className="mb-5 pb-3 border-b border-gray-100">
                            <h3 className="text-lg sm:text-xl md:text-[clamp(1.2rem,1.4vw,1.6rem)] font-bold text-[#1B1B1B]">
                                Job Details &amp; Responsibilities
                            </h3>

                            <p className="mt-1 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-gray-500">
                                Add the description, responsibilities and required skills.
                            </p>
                        </div>

                        <div className="space-y-6">

                            {/* Job Description */}
                            <div>
                                <label className="block text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53] mb-2">
                                    Job Description{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <textarea
                                    rows={4}
                                    value={formData.jobDescription}
                                    maxLength={LIMIT_JOB_DESC}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            jobDescription: e.target.value,
                                        });

                                        if (e.target.value.length >= LIMIT_JOB_DESC) {
                                            setValidationErrors((prev) => ({
                                                ...prev,
                                                jobDescription: `Job description must be under ${LIMIT_JOB_DESC} characters.`,
                                            }));
                                        } else if (validationErrors.jobDescription) {
                                            setValidationErrors((prev) => ({
                                                ...prev,
                                                jobDescription: "",
                                            }));
                                        }
                                    }}
                                    placeholder="Write detailed job description..."
                                    className={`
                                w-full
                                px-4
                                py-3
                                sm:px-5
                                sm:py-3.5
                                rounded-xl
                                border
                                text-base
                                sm:text-lg
                                md:text-[clamp(1rem,1.15vw,1.25rem)]
                                text-[#2d3a53]
                                bg-white
                                leading-relaxed
                                resize-y
                                focus:outline-none
                                focus:ring-1
                                focus:ring-[#34CBEA]/10
                                focus:border-[#34CBEA]
                                ${validationErrors.jobDescription ||
                                            formData.jobDescription.length >= LIMIT_JOB_DESC
                                            ? "border-red-500 bg-red-50/20"
                                            : "border-gray-300"
                                        }
                            `}
                                />

                                {validationErrors.jobDescription && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                                        {validationErrors.jobDescription}
                                    </p>
                                )}
                            </div>

                            {/* Key Responsibilities */}
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <label className="text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53]">
                                        Key Responsibilities{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleAddResponsibility}
                                        className="
                                    shrink-0
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-3.5
                                    py-2
                                    rounded-lg
                                    text-xs
                                    sm:text-sm
                                    font-bold
                                    text-[#d99024]
                                    hover:bg-amber-50
                                    transition-colors
                                    cursor-pointer
                                "
                                    >
                                        <FaPlus size={12} />
                                        Add Responsibility
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.responsibilities.map((resp, idx) => (
                                        <div key={idx}>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <span className="w-5 sm:w-6 shrink-0 text-right text-sm sm:text-base font-bold text-gray-400">
                                                    {idx + 1}.
                                                </span>

                                                <input
                                                    type="text"
                                                    value={resp}
                                                    maxLength={LIMIT_RESPONSIBILITY}
                                                    onChange={(e) =>
                                                        handleResponsibilityChange(
                                                            idx,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. Develop and maintain web applications."
                                                    className={`
                                                flex-1
                                                min-w-0
                                                px-4
                                                py-3
                                                rounded-xl
                                                border
                                                text-base
                                                sm:text-lg
                                                md:text-[clamp(0.95rem,1.1vw,1.2rem)]
                                                text-[#2d3a53]
                                                focus:outline-none
                                                focus:ring-1
                                                focus:ring-[#34CBEA]/10
                                                focus:border-[#34CBEA]
                                                ${resp.length >=
                                                            LIMIT_RESPONSIBILITY
                                                            ? "border-red-400 bg-red-50/20"
                                                            : "border-gray-300"
                                                        }
                                            `}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveResponsibility(idx)
                                                    }
                                                    title="Remove Responsibility"
                                                    className="
                                                shrink-0
                                                p-2.5
                                                rounded-xl
                                                text-gray-400
                                                hover:text-red-600
                                                hover:bg-red-50
                                                transition-colors
                                                cursor-pointer
                                            "
                                                >
                                                    <FaTrashAlt size={16} />
                                                </button>
                                            </div>

                                            {resp.length >= LIMIT_RESPONSIBILITY && (
                                                <p className="mt-1 ml-8 text-xs sm:text-sm text-red-600">
                                                    Responsibility must be under{" "}
                                                    {LIMIT_RESPONSIBILITY} characters.
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {validationErrors.responsibilities && (
                                    <p className="mt-2 text-xs sm:text-sm text-red-600">
                                        {validationErrors.responsibilities}
                                    </p>
                                )}
                            </div>

                            {/* Required Skills */}
                            <div>
                                <label className="block text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#2d3a53] mb-2">
                                    Required Skills
                                </label>

                                {formData.requiredSkills?.length > 0 && (
                                    <div className="flex flex-wrap gap-2.5 mb-3">
                                        {formData.requiredSkills.map((skill, index) => (
                                            <div
                                                key={`${skill}-${index}`}
                                                className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            px-3.5
                                            py-1.5
                                            rounded-full
                                            bg-blue-50
                                            text-blue-700
                                            border
                                            border-blue-200
                                            text-xs
                                            sm:text-sm
                                            md:text-[clamp(0.85rem,0.95vw,1.05rem)]
                                            font-bold
                                        "
                                            >
                                                <span>{skill}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveSkill(skill)
                                                    }
                                                    title={`Remove ${skill}`}
                                                    className="
                                                p-0.5
                                                rounded-full
                                                hover:bg-white/50
                                                transition-colors
                                                cursor-pointer
                                            "
                                                >
                                                    <FaTimes size={11} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-2.5 w-full sm:max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Type required skill..."
                                        value={formData.customSkill}
                                        maxLength={LIMIT_SKILL}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customSkill: e.target.value,
                                            })
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddCustomSkill();
                                            }
                                        }}
                                        className={`
                                    flex-1
                                    min-w-0
                                    px-4
                                    py-3
                                    rounded-xl
                                    border
                                    text-base
                                    sm:text-lg
                                    md:text-[clamp(0.95rem,1.1vw,1.2rem)]
                                    text-[#2d3a53]
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[#34CBEA]/10
                                    focus:border-[#34CBEA]
                                    ${formData.customSkill.length >= LIMIT_SKILL
                                                ? "border-red-400"
                                                : "border-gray-300"
                                            }
                                `}
                                    />

                                    <Button
                                        type="button"
                                        onClick={handleAddCustomSkill}
                                        size="sm"
                                        className="shrink-0 text-sm sm:text-base font-bold px-5 py-3"
                                    >
                                        Add Skill
                                    </Button>
                                </div>

                                {formData.customSkill.length >= LIMIT_SKILL && (
                                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                                        Skill name must be under {LIMIT_SKILL} characters.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>


                    <div className="pt-6 border-t border-gray-100">
                        {Object.values(validationErrors).some((e) => e) && (
                            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 text-center">
                                Please fill in all required fields correctly before
                                submitting.
                            </div>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-7 py-3 sm:px-8 sm:py-3.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.15rem)] font-bold transition-colors cursor-pointer active:scale-95"
                            >
                                Cancel
                            </button>

                            <Button
                                type="submit"
                                loading={isSaving || saving}
                                disabled={
                                    isSaving ||
                                    saving ||
                                    formData.roleName.length >= LIMIT_ROLE_NAME ||
                                    formData.jobDescription.length >= LIMIT_JOB_DESC ||
                                    formData.responsibilities.some(
                                        (r) => r.length >= LIMIT_RESPONSIBILITY
                                    ) ||
                                    formData.customLanguage.length >= LIMIT_LANGUAGE ||
                                    formData.customSkill.length >= LIMIT_SKILL
                                }
                                className="w-full sm:w-auto min-w-[160px] px-8 py-3 sm:px-9 sm:py-3.5 text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.15rem)] font-bold shadow-sm"
                            >
                                {isSaving || saving
                                    ? "Saving…"
                                    : editingPosition
                                    ? "Update Position"
                                    : "Save Position"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>


    );
}
