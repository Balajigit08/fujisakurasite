"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { FaMapMarkerAlt, FaCheck } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import BrandLoader from "@/app/components/BrandLoader/BrandLoader";
import Button from "@/app/components/common/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import CountryCodeDropdown from "@/app/components/CountryCodeDropdown/CountryCodeDropdown";
import { isValidEmail } from "@/lib/validation/email";

export default function CareerApplyPage() {
    const { t, lang } = useLanguage();
    const params = useParams();
    const jobId = params.id;

    const [job, setJob] = useState(null);
    const [jobLoading, setJobLoading] = useState(true);
    const [jobError, setJobError] = useState(null);

    const recaptchaRef = useRef(null);
    const [captchaToken, setCaptchaToken] = useState(null);

    const [fullName, setFullName] = useState("");
    const [fullNameError, setFullNameError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [dobError, setDobError] = useState("");
    const [qualification, setQualification] = useState("");
    const [qualificationError, setQualificationError] = useState("");
    const [isBilingual, setIsBilingual] = useState(false);
    const [jpLevel, setJpLevel] = useState("");
    const [jpLevelError, setJpLevelError] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeLabel, setResumeLabel] = useState("");
    const [resumeError, setResumeError] = useState("");

    // Character limits
    const LIMIT_NAME = 50;
    const LIMIT_EMAIL = 100;
    const LIMIT_QUALIFICATION = 150;

    const [submitting, setSubmitting] = useState(false);
    const [captchaError, setCaptchaError] = useState("");
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        if (!jobId) return;
        fetch(`/api/careers/jobs/${jobId}`)
            .then((r) => {
                if (!r.ok) throw new Error("Job not found");
                return r.json();
            })
            .then((data) => setJob(data.job))
            .catch(() => setJobError("This job is no longer available."))
            .finally(() => setJobLoading(false));
    }, [jobId]);

    // Auto-set country code based on language
    useEffect(() => {
        if (lang === "ja") {
            setCountryCode("+81");
        } else {
            setCountryCode("+91");
        }
    }, [lang]);

    // Recalculate Lenis smooth scroll height and update navbar after dynamic content loads
    useEffect(() => {
        if (!jobLoading) {
            const timer1 = setTimeout(() => {
                if (typeof window !== "undefined") {
                    if (window.lenis) window.lenis.resize();
                    window.dispatchEvent(new Event("navbar-change"));
                }
            }, 100);
            const timer2 = setTimeout(() => {
                if (typeof window !== "undefined") {
                    if (window.lenis) window.lenis.resize();
                    window.dispatchEvent(new Event("navbar-change"));
                }
            }, 500);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [jobLoading, job]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.type !== "application/pdf") {
            setResumeError("Only PDF files are accepted.");
            setResumeFile(null);
            setResumeLabel("");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_SIZE) {
            setResumeError("Resume file must be 5 MB or smaller.");
            setResumeFile(null);
            setResumeLabel("");
            e.target.value = "";
            return;
        }

        setResumeError("");
        setResumeFile(file);
        setResumeLabel(file.name);
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear all errors
        setFullNameError(""); setEmailError(""); setPhoneError("");
        setDobError(""); setQualificationError(""); setResumeError("");
        setCaptchaError(""); setJpLevelError("");

        let hasError = false;

        if (!fullName.trim()) {
            setFullNameError(t("career.error_name"));
            hasError = true;
        } else if (fullName.trim().length >= LIMIT_NAME) {
            setFullNameError(`Full name must be under ${LIMIT_NAME} characters.`);
            hasError = true;
        } else if (/[^a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF\s.\-]/.test(fullName)) {
            setFullNameError("Name should only contain letters, spaces, dots, or hyphens.");
            hasError = true;
        }

        if (!email.trim()) {
            setEmailError(t("career.error_email_required"));
            hasError = true;
        } else if (!isValidEmail(email)) {
            setEmailError(t("career.error_email_invalid"));
            hasError = true;
        } else if (email.trim().length >= LIMIT_EMAIL) {
            setEmailError(`Email must be under ${LIMIT_EMAIL} characters.`);
            hasError = true;
        }

        const todayStr = new Date().toISOString().split("T")[0];
        if (!dateOfBirth) {
            setDobError(t("career.error_dob"));
            hasError = true;
        } else if (dateOfBirth > todayStr) {
            setDobError(t("career.error_dob_future") || "Date of birth cannot be in the future.");
            hasError = true;
        } else if (dateOfBirth < "1920-01-01") {
            setDobError("Please enter a valid date of birth.");
            hasError = true;
        }

        if (!qualification.trim()) {
            setQualificationError(t("career.error_qualification"));
            hasError = true;
        } else if (qualification.trim().length >= LIMIT_QUALIFICATION) {
            setQualificationError(`Qualification must be under ${LIMIT_QUALIFICATION} characters.`);
            hasError = true;
        }

        const phoneDigits = phone.replace(/\D/g, "");
        if (!phoneDigits) {
            setPhoneError(t("career.error_phone_required"));
            hasError = true;
        } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
            setPhoneError("Phone number must be between 10 and 15 digits.");
            hasError = true;
        } else if (/^(\d)\1+$/.test(phoneDigits)) {
            setPhoneError("Please enter a valid phone number.");
            hasError = true;
        }

        if (!resumeFile || !(resumeFile instanceof File)) {
            setResumeError(t("career.error_resume_required"));
            hasError = true;
        } else if (resumeFile.size > 5 * 1024 * 1024) {
            setResumeError("Resume file must be 5 MB or smaller.");
            hasError = true;
        } else if (resumeFile.type !== "application/pdf") {
            setResumeError("Only PDF files are accepted.");
            hasError = true;
        }

        if (!captchaToken) {
            setCaptchaError(t("career.error_recaptcha"));
            hasError = true;
        }

        if (isBilingual && !jpLevel) {
            setJpLevelError(t("career.error_jp_level"));
            hasError = true;
        }

        if (hasError) return;

        setSubmitting(true);

        try {
            const fd = new FormData();
            fd.append("job_id", jobId);
            fd.append("full_name", fullName);
            fd.append("email", email);
            fd.append("phone", `${countryCode}${phoneDigits}`);
            fd.append("date_of_birth", dateOfBirth);
            fd.append("qualification", qualification);
            fd.append("is_jp_bilingual", isBilingual ? "1" : "0");
            if (isBilingual && jpLevel) fd.append("jp_level", jpLevel);
            fd.append("resume", resumeFile);
            fd.append("captcha_token", captchaToken);

            const res = await fetch("/api/careers/apply", { method: "POST", body: fd });
            const data = await res.json();

            if (!res.ok) {
                setFullNameError(data.error || t("career.error_failed"));
                return;
            }

            setFullName("");
            setFullNameError("");
            setEmail("");
            setEmailError("");
            setPhone("");
            setPhoneError("");
            setDateOfBirth("");
            setDobError("");
            setQualification("");
            setQualificationError("");
            setIsBilingual(false);
            setJpLevel("");
            setJpLevelError("");
            setResumeFile(null);
            setResumeLabel("");
            setResumeError("");
            setCaptchaError("");
            recaptchaRef.current?.reset();
            setCaptchaToken(null);

            showToast(t("career.success_toast"));
        } catch {
            setFullNameError(t("career.error_generic"));
        } finally {
            setSubmitting(false);
        }
    };

    if (jobLoading) {
        return <BrandLoader fullScreen targetProgress={100} label={t("career.loading_details")} />;
    }

    if (jobError || !job) {
        return (
            <div data-navbar="light" className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
                <p className="text-[#2d3a53] text-lg font-semibold">{jobError || t("career.job_not_found")}</p>
                <Link href="/career" className="text-[#556ee6] underline text-sm font-medium">{t("career.back_to_careers")}</Link>
            </div>
        );
    }

    const imageUrl = job.image_url
        ? (job.image_url.startsWith("job-images/") ? `/api/images/${job.image_url}` : job.image_url)
        : (job.image || "/FS-images/fuji-logo.png");
    const employmentType = job.employment_type || job.type || "Full Time";

    return (
        <main data-navbar="light" className="overflow-x-hidden w-full max-w-[2050px] mx-auto min-h-screen pt-[clamp(6rem,8vw,7.5rem)] pb-16 px-4 sm:px-6 lg:px-[clamp(2rem,4vw,4rem)] font-sans bg-white">
            <div className="w-full max-w-[1800px] 2xl:max-w-[2050px] mx-auto">
                {toastMessage && (
                    <div className="fixed top-24 right-4 z-[9999] px-5 py-3 rounded-xl text-white flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 bg-emerald-600">
                        <FaCheck size={16} />
                        <span>{toastMessage}</span>
                    </div>
                )}

                <div className="relative w-full h-[clamp(100px,20vw,200px)] rounded-tl-[clamp(30px,5vw,60px)] rounded-br-[clamp(30px,5vw,60px)] rounded-tr-none rounded-bl-none overflow-hidden mb-[clamp(1.5rem,3vw,2.5rem)] shadow-md">
                    <Image quality={100}
                        src="/FS-images/career-top.jpg"
                        alt={job.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1400px) 90vw, 1800px"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h3 className="text-white text-2xl sm:text-3xl md:text-[clamp(1.75rem,2.5vw,3rem)] font-bold tracking-tight text-center px-4">
                            {t("career.apply_for_position")}
                        </h3>
                    </div>
                </div>

                <Link href="/career" className="inline-flex items-center text-black font-semibold mb-6 sm:mb-8 text-sm sm:text-base md:text-[clamp(1rem,1.1vw,1.2rem)] hover:text-[#34CBEA] transition-colors">
                    <MdKeyboardArrowLeft size={24} className="mr-1" /> {t("career.back_to_careers")}
                </Link>

                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 mb-10 sm:mb-16 items-start">
                    <div className="lg:w-[58%] flex flex-col gap-8 w-full">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                    <Image quality={100}
                                        src={imageUrl}
                                        alt={job.title}
                                        width={80}
                                        height={80}
                                        unoptimized
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl md:text-[clamp(1.75rem,2.2vw,2.75rem)] font-bold text-[#1B1B1B] leading-tight capitalize">{job.title}</h1>
                                    <p className="text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.35rem)] text-[#64748b] font-medium mt-1">{job.company || "FujiSakura Technologies"}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-4 sm:mt-6">
                                <div className="flex items-center gap-1.5 text-[#34CBEA] font-semibold text-xs sm:text-sm md:text-[clamp(0.9rem,1.05vw,1.15rem)] bg-[#EDF6FA] px-4 py-2 rounded-full">
                                    <FaMapMarkerAlt /> {job.location || "Chennai"}
                                </div>
                                <div className="text-[#2d3a53] bg-gray-100 px-4 py-2 rounded-full font-semibold text-xs sm:text-sm md:text-[clamp(0.9rem,1.05vw,1.15rem)]">
                                    {employmentType.toLowerCase() === "full time"
                                        ? t("career.full_time")
                                        : employmentType.toLowerCase() === "part time"
                                        ? t("career.part_time")
                                        : employmentType}
                                </div>
                                <div className="text-[#2d3a53] bg-gray-100 px-4 py-2 rounded-full font-semibold text-xs sm:text-sm md:text-[clamp(0.9rem,1.05vw,1.15rem)]">
                                    {t("career.experience")}: {job.experience || "1 - 2 years"}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 sm:space-y-8">
                            <div>
                                <h2 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.75vw,2.25rem)] font-bold text-[#1B1B1B] mb-3 sm:mb-4 leading-tight">{t("career.job_description")}</h2>
                                <p className="text-[#2E2E2E] text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.35rem)] leading-relaxed whitespace-pre-line max-h-[300px] overflow-y-auto pr-2">
                                    {job.description || "No description provided."}
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.75vw,2.25rem)] font-bold text-[#1B1B1B] mb-3 sm:mb-4 leading-tight">{t("career.key_responsibilities")}</h2>
                                <ul className="list-disc pl-6 space-y-2.5 text-[#2E2E2E] text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.35rem)] leading-relaxed">
                                    {Array.isArray(job.responsibilities) && job.responsibilities.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </div>

                            {((Array.isArray(job.required_skills) && job.required_skills.length > 0) ||
                                (Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0)) && (
                                    <div className="pt-6 border-t border-gray-100">
                                        <h2 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.75vw,2.25rem)] font-bold text-[#1B1B1B] mb-3 sm:mb-4 leading-tight">{t("career.required_skills")}</h2>
                                        <div className="flex flex-wrap gap-2.5 sm:gap-3">
                                            {(Array.isArray(job.required_skills) && job.required_skills.length > 0
                                                ? job.required_skills
                                                : job.requiredSkills
                                            ).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm md:text-[clamp(0.9rem,1.05vw,1.15rem)] font-medium bg-[#EDF6FA] text-[#1B1B1B] border border-[#34CBEA]/40 shadow-2xs"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="lg:w-[42%] w-full rounded-2xl">
                        <div className="p-5 sm:p-7 lg:p-7 xl:p-9 rounded-2xl border border-gray-200 bg-[#EDF6FA] shadow-sm">
                            <h2 className="text-2xl sm:text-3xl md:text-[clamp(1.75rem,2.2vw,2.75rem)] font-bold text-[#1B1B1B] mb-5 sm:mb-7 text-center leading-tight">
                                {t("career.apply_for_position")}
                            </h2>

                            <form className="space-y-4 sm:space-y-4" onSubmit={handleSubmit} noValidate>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-[#1B1B1B]">{t("career.full_name")} <span className="text-red-500 font-bold">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={LIMIT_NAME}
                                        value={fullName}
                                        onKeyDown={(e) => {
                                            const allowed = /^[a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF\s.\-]$/;
                                            const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Home", "End"];
                                            if (!allowed.test(e.key) && !controlKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(e) => {
                                            setFullName(e.target.value);
                                            if (e.target.value.length >= LIMIT_NAME) {
                                                setFullNameError(`Full name must be under ${LIMIT_NAME} characters.`);
                                            } else {
                                                setFullNameError("");
                                            }
                                        }}
                                        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/30 focus:border-[#34CBEA] text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-[#1B1B1B] bg-white transition shadow-2xs ${fullNameError || fullName.length >= LIMIT_NAME ? "border-red-400 bg-red-50/30" : "border-[#a6bafb]"}`}
                                    />
                                    {fullNameError && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{fullNameError}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-[#1B1B1B]">{t("career.email")} <span className="text-red-500 font-bold">*</span></label>
                                    <input
                                        type="email"
                                        required
                                        maxLength={LIMIT_EMAIL}
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setEmailError("");
                                            if (e.target.value.length >= LIMIT_EMAIL) {
                                                setEmailError(`Email must be under ${LIMIT_EMAIL} characters.`);
                                            }
                                        }}
                                        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/30 focus:border-[#34CBEA] text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-[#1B1B1B] bg-white transition shadow-2xs ${emailError || email.length >= LIMIT_EMAIL ? "border-red-400 bg-red-50/30" : "border-[#a6bafb]"}`}
                                    />
                                    {emailError && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{emailError}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-[#1B1B1B]">{t("career.date_of_birth")} <span className="text-red-500 font-bold">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        max={new Date().toISOString().split("T")[0]}
                                        value={dateOfBirth}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDateOfBirth(val);
                                            const today = new Date().toISOString().split("T")[0];
                                            if (val && val > today) {
                                                setDobError(t("career.error_dob_future") || "Date of birth cannot be in the future.");
                                            } else {
                                                setDobError("");
                                            }
                                        }}
                                        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/30 focus:border-[#34CBEA] text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-[#1B1B1B] bg-white transition shadow-2xs ${dobError ? "border-red-400 bg-red-50/30" : "border-[#a6bafb]"}`}
                                    />
                                    {dobError && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{dobError}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-[#1B1B1B]">{t("career.qualification")} <span className="text-red-500 font-bold">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={LIMIT_QUALIFICATION}
                                        value={qualification}
                                        onChange={(e) => {
                                            setQualification(e.target.value);
                                            if (e.target.value.length >= LIMIT_QUALIFICATION) {
                                                setQualificationError(`Qualification must be under ${LIMIT_QUALIFICATION} characters.`);
                                            } else {
                                                setQualificationError("");
                                            }
                                        }}
                                        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/30 focus:border-[#34CBEA] text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-[#1B1B1B] bg-white transition shadow-2xs ${qualificationError ? "border-red-400 bg-red-50/30" : "border-[#a6bafb]"}`}
                                    />
                                    {qualificationError && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{qualificationError}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-[#1B1B1B]">{t("career.phone")} <span className="text-red-500 font-bold">*</span></label>
                                    <div className={`relative z-20 flex items-center bg-white rounded-xl border focus-within:ring-2 focus-within:ring-[#34CBEA]/30 focus-within:border-[#34CBEA] transition shadow-2xs ${phoneError ? "border-red-400 bg-red-50/30" : "border-[#a6bafb]"}`}>
                                        <CountryCodeDropdown
                                            value={countryCode}
                                            onChange={setCountryCode}
                                            borderColor="border-[#a6bafb]"
                                        />
                                        <input
                                            type="tel"
                                            required
                                            maxLength={15}
                                            value={phone}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
                                                setPhone(digits);
                                                setPhoneError("");
                                            }}
                                            placeholder={t("career.phone_placeholder") || t("contact.phone_placeholder")}
                                            className="flex-1 min-w-0 bg-transparent px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-[#1B1B1B] border-0 outline-none focus:outline-none focus:ring-0 rounded-r-xl"
                                        />
                                    </div>
                                    {phoneError && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal text-start">{phoneError}</p>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-[#1B1B1B]">{t("career.resume")} <span className="text-red-500 font-bold">*</span></label>
                                    <div className={`relative w-full border rounded-xl bg-white overflow-hidden flex items-center h-[52px] sm:h-[58px] shadow-2xs ${resumeError ? "border-red-400" : "border-[#a6bafb]"}`}>
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            required
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full flex items-center text-base sm:text-lg px-3 py-1.5">
                                            <span className="bg-[#f0f0f0] border border-[#ccc] px-4 sm:px-5 py-2 sm:py-2.5 text-black rounded-lg cursor-pointer whitespace-nowrap font-semibold hover:bg-gray-200 transition text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.25rem)]">{t("career.choose_file")}</span>
                                            <span className="text-gray-500 ml-3 truncate font-medium text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.25rem)]">{resumeLabel || t("career.no_file_chosen")}</span>
                                        </div>
                                    </div>
                                    {resumeError
                                        ? <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{resumeError}</p>
                                        : <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-gray-500">{t("career.pdf_limit")}</p>
                                    }
                                </div>

                                <div className="pt-2 w-full">
                                    <div className={`border rounded-xl p-3 sm:p-3.5 px-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full shadow-2xs ${jpLevelError ? "border-red-400" : "border-[#a6bafb]"}`}>
                                        <label className="flex items-center gap-2.5 cursor-pointer text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.35rem)] font-semibold text-[#1B1B1B] select-none">
                                            <input
                                                type="checkbox"
                                                checked={isBilingual}
                                                onChange={(e) => {
                                                    setIsBilingual(e.target.checked);
                                                    if (!e.target.checked) { setJpLevel(""); setJpLevelError(""); }
                                                }}
                                                className="w-5 h-5 border-[#a6bafb] rounded text-[#34CBEA] focus:ring-[#34CBEA] bg-white cursor-pointer shrink-0"
                                            />
                                            <span>{t("career.jp_bilingual")}</span>
                                        </label>
                                        <div className="w-full sm:w-auto flex justify-start sm:justify-end shrink-0">
                                            <select
                                                value={jpLevel}
                                                onChange={(e) => {
                                                    setJpLevel(e.target.value);
                                                    setJpLevelError("");
                                                }}
                                                disabled={!isBilingual}
                                                className={`status-select-pill text-sm sm:text-base md:text-[clamp(0.95rem,1.05vw,1.15rem)] border font-medium ${isBilingual ? "border-[#a6bafb] text-[#1B1B1B] bg-white cursor-pointer" : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"} rounded-lg pl-3.5 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#34CBEA] w-full sm:w-[130px]`}
                                            >
                                                <option value="" disabled>{t("career.level")}</option>
                                                <option value="N1">N1</option>
                                                <option value="N2">N2</option>
                                                <option value="N3">N3</option>
                                                <option value="N4">N4</option>
                                                <option value="N5">N5</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {jpLevelError && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{jpLevelError}</p>}

                                <div className="flex flex-col items-center pt-2 w-full gap-1">
                                    <div className="w-[243px] h-[63px] min-[380px]:w-[274px] min-[380px]:h-[71px] sm:w-[304px] sm:h-[78px] mx-auto overflow-hidden">
                                        <div className="w-[304px] h-[78px] origin-top-left scale-[0.80] min-[380px]:scale-[0.90] sm:scale-100">
                                            <ReCAPTCHA
                                                ref={recaptchaRef}
                                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                                onChange={(token) => { setCaptchaToken(token); setCaptchaError(""); }}
                                                onExpired={() => setCaptchaToken(null)}
                                            />
                                        </div>
                                    </div>
                                    {captchaError && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal text-center">{captchaError}</p>}
                                </div>

                                <div className="pt-4 flex flex-col items-center gap-3">
                                    {(fullNameError || emailError || dobError || qualificationError || phoneError || resumeError || jpLevelError) && (
                                        <div className="w-full flex items-start gap-2 px-4 py-3 rounded-xl text-sm sm:text-base md:text-[clamp(0.95rem,1.05vw,1.15rem)] text-red-600 font-medium bg-red-50 border border-red-200">
                                            <span>Please fill in all required fields correctly before submitting.</span>
                                        </div>
                                    )}
                                    <Button
                                        type="submit"
                                        loading={submitting}
                                        disabled={submitting || fullName.length >= LIMIT_NAME || email.length >= LIMIT_EMAIL || qualification.length >= LIMIT_QUALIFICATION}
                                        className="text-lg sm:text-xl md:text-[clamp(1.15rem,1.35vw,1.55rem)] px-12 sm:px-16 py-3.5 sm:py-4.5 w-full sm:w-auto min-w-[240px] font-bold shadow-md"
                                    >
                                        {submitting ? t("career.submitting") : t("career.submit_application")}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
