"use client";

import Image from "next/image";
import Button from "@/app/components/common/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ContactAddress() {
    const { t } = useLanguage();

    return (
        <section
            id="contact-address-section"
            data-navbar="light"
            className="w-full bg-white pb-[clamp(3rem,5vw,6rem)]"
        >
            <div className="w-full max-w-[1800px] 2xl:max-w-[2050px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch w-full">
                    {/* Tokyo, Japan - Head Office */}
                    <div className="border border-gray-200 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                        <div>
                            <div className="w-full h-[220px] sm:h-[260px] overflow-hidden relative group">
                                <Image quality={100}
                                    src="/FS-images/japan-office.jpg"
                                    alt="Tokyo, Japan Head Office"
                                    fill
                                    sizes="(max-width: 1024px) 95vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                <div className="absolute top-0 left-0 bg-black/75 backdrop-blur-md text-white px-4 py-2 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold uppercase tracking-wider rounded-br-xl">
                                    {t("contact.head_office")}
                                </div>
                            </div>

                            <div className="p-5 sm:p-7">
                                <div className="flex items-center gap-3.5 mb-3.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-xs">
                                        <svg className="w-full h-full" viewBox="0 0 600 600">
                                            <rect width="600" height="600" fill="#fff" />
                                            <circle cx="300" cy="300" r="180" fill="#bc002d" />
                                        </svg>
                                    </div>

                                    <h3 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.75vw,2.15rem)] font-bold text-[#1E3A8A] tracking-tight">
                                        {t("contact.tokyo_title")}
                                    </h3>
                                </div>

                                <p className="text-sm sm:text-base md:text-[clamp(1.025rem,1.15vw,1.3rem)] text-gray-600 leading-relaxed whitespace-pre-line">
                                    <strong className="text-gray-900 font-bold block mb-1.5 text-base sm:text-lg md:text-[clamp(1.1rem,1.25vw,1.4rem)]">
                                        {t("contact.tokyo_company")}
                                    </strong>
                                    {t("contact.tokyo_address")}
                                </p>
                            </div>
                        </div>

                        <div className="px-5 sm:px-7 py-3.5 sm:py-4.5 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
                            <span className="text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-semibold text-gray-700">
                                {t("contact.tokyo_phone")}
                            </span>

                            <Button
                                href="https://maps.app.goo.gl/wMwsspfYfqkEDkyr8"
                                size="sm"
                                className="text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.2rem)] font-semibold px-4 sm:px-5 py-2 sm:py-2.5"
                            >
                                <span>&raquo;</span>
                                <span>{t("contact.view_map")}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Chennai, India - Branch Office */}
                    <div className="border border-gray-200 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                        <div>
                            <div className="w-full h-[220px] sm:h-[260px] overflow-hidden relative group">
                                <Image quality={100}
                                    src="/FS-images/india-office.jpg"
                                    alt="Chennai, India Branch Office"
                                    fill
                                    sizes="(max-width: 1024px) 95vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                <div className="absolute top-0 left-0 bg-black/75 backdrop-blur-md text-white px-4 py-2 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold uppercase tracking-wider rounded-br-xl">
                                    {t("contact.branch_office")}
                                </div>
                            </div>

                            <div className="p-5 sm:p-7">
                                <div className="flex items-center gap-3.5 mb-3.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-xs">
                                        <svg className="w-full h-full" viewBox="0 0 600 600">
                                            <rect width="600" height="200" fill="#FF9933" />
                                            <rect y="200" width="600" height="200" fill="#FFFFFF" />
                                            <rect y="400" width="600" height="200" fill="#138808" />
                                            <circle cx="300" cy="300" r="70" fill="none" stroke="#000080" strokeWidth="10" />
                                            <circle cx="300" cy="300" r="14" fill="#000080" />
                                            {Array.from({ length: 24 }).map((_, i) => (
                                                <line
                                                    key={i}
                                                    x1="300"
                                                    y1="300"
                                                    x2={300 + 70 * Math.cos((i * 15 * Math.PI) / 180)}
                                                    y2={300 + 70 * Math.sin((i * 15 * Math.PI) / 180)}
                                                    stroke="#000080"
                                                    strokeWidth="4"
                                                />
                                            ))}
                                        </svg>
                                    </div>

                                    <h3 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.75vw,2.15rem)] font-bold text-[#1E3A8A] tracking-tight">
                                        {t("contact.chennai_title")}
                                    </h3>
                                </div>

                                <p className="text-sm sm:text-base md:text-[clamp(1.025rem,1.15vw,1.3rem)] text-gray-600 leading-relaxed whitespace-pre-line">
                                    <strong className="text-gray-900 font-bold block mb-1.5 text-base sm:text-lg md:text-[clamp(1.1rem,1.25vw,1.4rem)]">
                                        {t("contact.chennai_company")}
                                    </strong>
                                    {t("contact.chennai_address")}
                                </p>
                            </div>
                        </div>

                        <div className="px-5 sm:px-7 py-3.5 sm:py-4.5 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
                            <span className="text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-semibold text-gray-700">
                                {t("contact.chennai_phone")}
                            </span>

                            <Button
                                href="https://maps.app.goo.gl/LVuSzKwD3joBUUH37"
                                size="sm"
                                className="text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.2rem)] font-semibold px-4 sm:px-5 py-2 sm:py-2.5"
                            >
                                <span>&raquo;</span>
                                <span>{t("contact.view_map")}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Chennai, India - Registered Office */}
                    <div className="border border-gray-200 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                        <div>
                            <div className="w-full h-[220px] sm:h-[260px] overflow-hidden relative group">
                                <Image quality={100}
                                    src="/FS-images/registered-office.jpg"
                                    alt="Chennai, India Registered Office"
                                    fill
                                    sizes="(max-width: 1024px) 95vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                <div className="absolute top-0 left-0 bg-black/75 backdrop-blur-md text-white px-4 py-2 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold uppercase tracking-wider rounded-br-xl">
                                    {t("contact.registered_office")}
                                </div>
                            </div>

                            <div className="p-5 sm:p-7">
                                <div className="flex items-center gap-3.5 mb-3.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-xs">
                                        <svg className="w-full h-full" viewBox="0 0 600 600">
                                            <rect width="600" height="200" fill="#FF9933" />
                                            <rect y="200" width="600" height="200" fill="#FFFFFF" />
                                            <rect y="400" width="600" height="200" fill="#138808" />
                                            <circle cx="300" cy="300" r="70" fill="none" stroke="#000080" strokeWidth="10" />
                                            <circle cx="300" cy="300" r="14" fill="#000080" />
                                            {Array.from({ length: 24 }).map((_, i) => (
                                                <line
                                                    key={i}
                                                    x1="300"
                                                    y1="300"
                                                    x2={300 + 70 * Math.cos((i * 15 * Math.PI) / 180)}
                                                    y2={300 + 70 * Math.sin((i * 15 * Math.PI) / 180)}
                                                    stroke="#000080"
                                                    strokeWidth="4"
                                                />
                                            ))}
                                        </svg>
                                    </div>

                                    <h3 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.75vw,2.15rem)] font-bold text-[#1E3A8A] tracking-tight">
                                        {t("contact.reg_title")}
                                    </h3>
                                </div>

                                <p className="text-sm sm:text-base md:text-[clamp(1.025rem,1.15vw,1.3rem)] text-gray-600 leading-relaxed whitespace-pre-line">
                                    {t("contact.reg_address")}
                                </p>
                            </div>
                        </div>

                        <div className="px-5 sm:px-7 py-3.5 sm:py-4.5 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
                            <span className="text-sm sm:text-base md:text-[clamp(1rem,1.15vw,1.25rem)] font-semibold text-gray-700">
                                {t("contact.reg_tag")}
                            </span>

                            <Button
                                href="https://maps.google.com/?q=Jaladianpet+Chennai+TamilNadu+India"
                                size="sm"
                                className="text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.2rem)] font-semibold px-4 sm:px-5 py-2 sm:py-2.5"
                            >
                                <span>&raquo;</span>
                                <span>{t("contact.view_map")}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}