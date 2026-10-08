"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("cookie-consent");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: parsed }));
      } catch (e) {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (accepted: boolean) => {
    const prefs = { accepted };
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    setShowBanner(false);
    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: prefs }));
  };

  if (!mounted || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#FFFFFF] p-4 md:p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] transform-gpu transition-transform duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex-1 text-[#1B1B1B] text-[10px] min-[375px]:text-[11px] sm:text-xs md:text-base leading-tight md:leading-relaxed text-center md:text-left font-medium">
          This website uses cookies to offer a better experience. Please accept cookies for optimal performance.
        </div>
        <div className="flex flex-row items-center justify-center gap-3 w-full md:w-auto">
          <button
            onClick={() => saveConsent(false)}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors border-2 border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 active:scale-95 cursor-pointer whitespace-nowrap text-center touch-manipulation"
          >
            Decline
          </button>
          <button
            onClick={() => saveConsent(true)}
            className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-[#FFB54E] text-[#1a1a1a] font-semibold text-sm rounded-full hover:bg-[#e09e42] active:scale-95 transition-all whitespace-nowrap contact-btn touch-manipulation cursor-pointer shadow-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
