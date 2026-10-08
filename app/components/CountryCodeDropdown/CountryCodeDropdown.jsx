"use client";

import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { COUNTRY_CODES } from "@/lib/data/countries";

export default function CountryCodeDropdown({
    value = "+91",
    onChange = () => { },
    borderColor = "border-gray-200",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedCountry = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={`relative shrink-0 border-r ${borderColor}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-1.5 pl-3.5 pr-2.5 py-3 text-sm sm:text-base font-semibold text-[#1B1B1B] bg-transparent focus:outline-none cursor-pointer whitespace-nowrap"
            >
                <span>{selectedCountry.code} ({selectedCountry.iso})</span>
                <FaChevronDown
                    size={9}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-[#34CBEA]" : ""}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="absolute left-0 top-[calc(100%+6px)] z-50 w-52 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1"
                >
                    {COUNTRY_CODES.map((c) => (
                        <div
                            key={`${c.iso}-${c.code}`}
                            onClick={() => { onChange(c.code); setIsOpen(false); }}
                            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer transition-colors ${c.code === value ? "bg-[#EDF6FA] text-[#34CBEA]" : "hover:bg-gray-50 text-[#1B1B1B]"
                                }`}
                        >
                            <span>{c.code} ({c.iso})</span>
                            <span className="text-xs text-gray-400 font-normal truncate max-w-[80px] text-right">{c.country}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
