"use client";

import { useState, useRef, useEffect } from "react";
import { FiMapPin, FiSend, FiPhone } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import CountryCodeDropdown from "@/app/components/CountryCodeDropdown/CountryCodeDropdown";
import Button from "@/app/components/common/Button";
import { isValidEmail } from "@/lib/validation/email";

export default function ContactForm() {
    const { t, lang } = useLanguage();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        subject: "",
        phone: "",
        message: "",
    });
    const [countryCode, setCountryCode] = useState("+91");
    const [toastMessage, setToastMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [map1Loaded, setMap1Loaded] = useState(false);
    const [map2Loaded, setMap2Loaded] = useState(false);
    const recaptchaRef = useRef(null);
    const [captchaToken, setCaptchaToken] = useState(null);

    // Auto-set country code based on language
    useEffect(() => {
        if (lang === "ja") {
            setCountryCode("+81");
        } else {
            setCountryCode("+91");
        }
    }, [lang]);

    // Character limits
    const LIMIT_NAME = 50;
    const LIMIT_EMAIL = 100;
    const LIMIT_SUBJECT = 150;
    const LIMIT_MESSAGE = 2000;

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            const digits = value.replace(/\D/g, "").slice(0, 15);
            setFormData((prev) => ({ ...prev, phone: digits }));
            setErrors((prev) => ({ ...prev, phone: "" }));
            return;
        }

        // Sanitize fullName — block invalid chars via onKeyDown on the input
        if (name === "fullName") {
            setFormData((prev) => ({ ...prev, fullName: value }));
            setErrors((prev) => ({ ...prev, fullName: "" }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));

        const limits = { fullName: LIMIT_NAME, email: LIMIT_EMAIL, subject: LIMIT_SUBJECT, message: LIMIT_MESSAGE };
        if (limits[name] !== undefined) {
            if (value.length >= limits[name]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: `${name === "fullName" ? "Full name" : name === "email" ? "Email" : name === "subject" ? "Subject" : "Message"} must be under ${limits[name]} characters.`
                }));
            } else {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim())
            newErrors.fullName = t("contact.error_name");
        else if (formData.fullName.trim().length > LIMIT_NAME)
            newErrors.fullName = `Full name must be ${LIMIT_NAME} characters or fewer.`;
        else if (/[^a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF\s.\-]/.test(formData.fullName))
            newErrors.fullName = "Name should only contain letters, spaces, dots, or hyphens.";

        if (!formData.email.trim()) {
            newErrors.email = t("contact.error_email_required");
        } else if (!isValidEmail(formData.email.trim())) {
            newErrors.email = t("contact.error_email_invalid");
        } else if (formData.email.trim().length > LIMIT_EMAIL) {
            newErrors.email = `Email must be ${LIMIT_EMAIL} characters or fewer.`;
        }

        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (!phoneDigits) {
            newErrors.phone = t("contact.error_phone_required");
        } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
            newErrors.phone = "Phone number must be between 10 and 15 digits.";
        } else if (/^(\d)\1+$/.test(phoneDigits)) {
            newErrors.phone = "Please enter a valid phone number.";
        }

        if (formData.subject.trim().length > LIMIT_SUBJECT)
            newErrors.subject = `Subject must be ${LIMIT_SUBJECT} characters or fewer.`;

        if (!formData.message.trim())
            newErrors.message = t("contact.error_message");
        else if (formData.message.trim().length > LIMIT_MESSAGE)
            newErrors.message = `Message must be ${LIMIT_MESSAGE} characters or fewer.`;

        if (!captchaToken) {
            newErrors.captcha = t("contact.error_recaptcha") || "Please complete the reCAPTCHA verification.";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: `${countryCode}${formData.phone.replace(/\D/g, "")}`,
                    subject: formData.subject,
                    message: formData.message,
                    captchaToken: captchaToken,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors({ form: data.error || t("contact.error_generic") });
                recaptchaRef.current?.reset();
                setCaptchaToken(null);
                return;
            }

            setErrors({});
            setFormData({ fullName: "", email: "", subject: "", phone: "", message: "" });
            recaptchaRef.current?.reset();
            setCaptchaToken(null);
            setToastMessage(t("contact.success_message"));
            setTimeout(() => setToastMessage(null), 5000);
        } catch {
            setErrors({ form: t("contact.error_generic") });
            recaptchaRef.current?.reset();
            setCaptchaToken(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact-form-section" data-navbar="light" className="w-full mb-[clamp(2.5rem,4vw,4rem)]">
            <div className="w-full max-w-[1800px] 2xl:max-w-[2050px] mx-auto px-[clamp(1rem,2vw,2rem)]">
                <div className="w-full">
                    <div className="w-full mb-6 sm:mb-8 bg-white rounded-2xl p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row items-center lg:justify-around gap-4 sm:gap-6 border border-gray-100 shadow-xs">
                        <div className="flex items-center gap-3.5 sm:gap-4 justify-start md:justify-center">
                            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#ffb54e] flex items-center justify-center text-black shrink-0 shadow-xs">
                                <FiSend className="w-5 h-5 sm:w-6 sm:h-6 -rotate-12 translate-x-[1px]" />
                            </div>
                            <span className="text-base sm:text-lg md:text-[clamp(1.1rem,1.3vw,1.5rem)] font-bold text-gray-900 tracking-tight text-start">
                                hr@fujisakuratech.com
                            </span>
                        </div>

                        <div className="flex items-center gap-3.5 sm:gap-4 justify-start md:justify-center">
                            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#ffb54e] flex items-center justify-center text-black shrink-0 shadow-xs">
                                <FiPhone className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-base sm:text-lg md:text-[clamp(1.1rem,1.3vw,1.5rem)] font-bold text-gray-900 tracking-tight text-start">
                                +91 44 2952 0058
                            </span>
                        </div>

                        <div className="flex items-center gap-3.5 sm:gap-4 justify-start md:justify-center md:col-span-2 md:w-auto md:mx-auto lg:col-span-1 lg:w-auto lg:mx-0">
                            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#ffb54e] flex items-center justify-center text-black shrink-0 shadow-xs">
                                <FiPhone className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-base sm:text-lg md:text-[clamp(1.1rem,1.3vw,1.5rem)] font-bold text-gray-900 tracking-tight text-start">
                                +03-5829-6208
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch w-full">
                        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 h-full justify-between">
                            <div className="relative overflow-hidden flex-1 min-h-[260px] sm:min-h-[320px] lg:min-h-[360px] group rounded-2xl bg-gray-100 border border-gray-200">
                                {!map1Loaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 animate-pulse text-gray-400 gap-2 z-0">
                                        <FiMapPin className="w-8 h-8 text-[#ffb54e] animate-bounce" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("contact.loading_map")}</span>
                                    </div>
                                )}
                                <iframe
                                    title="Fujisakura Technologies India Office Location Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.836923700533!2d80.22487687330229!3d12.918200716050368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d8f2a4c7a79%3A0x754c584af730c373!2sFUJISAKURA%20TECHNOLOGIES%20PVT%20LTD!5e0!3m2!1sen!2sin!4v1788160880738!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="eager"
                                    onLoad={() => setMap1Loaded(true)}
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    className={`w-full h-full transition-opacity duration-500 relative z-10 ${map1Loaded ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </div>

                            <div className="relative overflow-hidden flex-1 min-h-[260px] sm:min-h-[320px] lg:min-h-[360px] group rounded-2xl bg-gray-100 border border-gray-200">
                                {!map2Loaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 animate-pulse text-gray-400 gap-2 z-0">
                                        <FiMapPin className="w-8 h-8 text-[#ffb54e] animate-bounce" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t("contact.loading_map")}</span>
                                    </div>
                                )}
                                <iframe
                                    title="Fujisakura Technologies Japan Office Location Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30827.769284850096!2d139.77481784707976!3d35.69250945110244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188995640e164d%3A0x504b481c7976e184!2zRlVKSVNBS1VSQVRFQ0hOT0xPR0lFU-agquW8j-S8muekvg!5e0!3m2!1sen!2sin!4v1788862666263!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="eager"
                                    onLoad={() => setMap2Loaded(true)}
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    className={`w-full h-full transition-opacity duration-500 relative z-10 ${map2Loaded ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-6 flex flex-col justify-between h-full bg-[#EDF6FA] p-5 sm:p-7 md:p-9 border border-gray-200 rounded-2xl shadow-sm">
                            <h2 className="text-2xl sm:text-3xl md:text-[clamp(1.75rem,2.2vw,2.75rem)] text-center font-bold tracking-wide text-black mb-5 sm:mb-7 uppercase leading-tight">
                                {t("contact.send_a_message")}
                            </h2>

                            {toastMessage && (
                                <div className="fixed top-24 right-4 z-[9999] px-6 py-3.5 rounded-xl text-white flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 bg-emerald-600 text-base font-semibold">
                                    <FaCheck size={18} />
                                    <span>{toastMessage}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4 flex-1 flex flex-col justify-between" noValidate>
                                <div className="space-y-4 sm:space-y-4">
                                    {errors.form && (
                                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-base text-red-600 font-medium">
                                            {errors.form}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-gray-800 mb-1.5">
                                                {t("contact.full_name")} <span className="text-red-500 font-bold ml-0.5">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onKeyDown={(e) => {
                                                    const allowed = /^[a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF\s.\-]$/;
                                                    const controlKeys = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab","Home","End"];
                                                    if (!allowed.test(e.key) && !controlKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={handleChange}
                                                required
                                                maxLength={LIMIT_NAME}
                                                placeholder=""
                                                className={`w-full bg-white rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-gray-900 border focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/20 focus:border-[#34CBEA] transition shadow-xs ${errors.fullName || formData.fullName.length >= LIMIT_NAME ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                                            />
                                            <div className="flex justify-between items-center mt-1">
                                                {errors.fullName && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{errors.fullName}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-gray-800 mb-1.5">
                                                {t("contact.email_address")} <span className="text-red-500 font-bold ml-0.5">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                maxLength={LIMIT_EMAIL}
                                                placeholder=""
                                                className={`w-full bg-white rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-gray-900 border focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/20 focus:border-[#34CBEA] transition shadow-xs ${errors.email || formData.email.length >= LIMIT_EMAIL ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                                            />
                                            <div className="flex justify-between items-center mt-1">
                                                {errors.email && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{errors.email}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-gray-800 mb-1.5">
                                            {t("contact.subject")}
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            maxLength={LIMIT_SUBJECT}
                                            placeholder=""
                                            className={`w-full bg-white rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-gray-900 border focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/20 focus:border-[#34CBEA] transition shadow-xs ${errors.subject || formData.subject.length >= LIMIT_SUBJECT ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            {errors.subject && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{errors.subject}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-gray-800 mb-1.5">
                                            {t("contact.phone_number")} <span className="text-red-500 font-bold ml-0.5">*</span>
                                        </label>
                                        <div className={`relative z-20 flex items-center bg-white rounded-xl border focus-within:ring-2 focus-within:ring-[#34CBEA]/20 focus-within:border-[#34CBEA] transition shadow-xs ${errors.phone ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}>
                                            <CountryCodeDropdown
                                                value={countryCode}
                                                onChange={setCountryCode}
                                                borderColor="border-gray-200"
                                            />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                maxLength={15}
                                                placeholder={t("contact.phone_placeholder")}
                                                className="flex-1 min-w-0 bg-transparent px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-gray-900 border-0 outline-none focus:outline-none focus:ring-0 rounded-r-xl"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal text-start mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.4rem)] font-semibold text-gray-800 mb-1.5">
                                            {t("contact.how_can_we_help")} <span className="text-red-500 font-bold ml-0.5">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            maxLength={LIMIT_MESSAGE}
                                            placeholder=""
                                            className={`w-full bg-white rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.3rem)] text-gray-900 border focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/20 focus:border-[#34CBEA] transition shadow-xs resize-none flex-1 ${errors.message || formData.message.length >= LIMIT_MESSAGE ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            {errors.message && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal">{errors.message}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-2 flex flex-col items-center justify-center w-full">
                                        <div className="w-[243px] h-[63px] min-[380px]:w-[274px] min-[380px]:h-[71px] sm:w-[304px] sm:h-[78px] mx-auto overflow-hidden">
                                            <div className="w-[304px] h-[78px] origin-top-left scale-[0.80] min-[380px]:scale-[0.90] sm:scale-100">
                                                <ReCAPTCHA
                                                    ref={recaptchaRef}
                                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                                    onChange={(token) => {
                                                        setCaptchaToken(token);
                                                        setErrors((prev) => ({ ...prev, captcha: "" }));
                                                    }}
                                                    onExpired={() => setCaptchaToken(null)}
                                                />
                                            </div>
                                        </div>
                                        {errors.captcha && <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] text-red-600 font-normal text-center mt-1.5">{errors.captcha}</p>}
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col items-center gap-3 w-full">
                                    {Object.entries(errors).some(([k, v]) => k !== "captcha" && Boolean(v)) && (
                                        <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base text-red-600 font-medium bg-red-50 border border-red-200">
                                            <span className="text-center">
                                                Please fill in all required fields correctly before sending.
                                            </span>
                                        </div>
                                    )}
                                    <Button
                                        type="submit"
                                        loading={loading}
                                        disabled={loading || formData.fullName.length >= LIMIT_NAME || formData.email.length >= LIMIT_EMAIL || formData.subject.length >= LIMIT_SUBJECT || formData.message.length >= LIMIT_MESSAGE}
                                        className="w-full sm:w-auto min-w-[240px] py-3.5 sm:py-4.5 px-10 md:px-14 text-lg sm:text-xl md:text-[clamp(1.15rem,1.35vw,1.55rem)] font-bold tracking-wider shadow-md"
                                    >
                                        {loading ? t("contact.sending") : t("contact.send_message")}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
