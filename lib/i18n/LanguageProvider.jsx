"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import en from "./en.json";
import ja from "./ja.json";
import BrandLoader from "@/app/components/BrandLoader/BrandLoader";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const translations = { en, ja };

const LanguageContext = createContext({
  lang: "en",
  setLang: () => { },
  toggleLang: () => { },
  t: (key) => key,
  isLangSwitching: false,
});

function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("preferred_language");
    if (saved === "ja" || saved === "en") return saved;

    const match = document.cookie.match(/(?:^|; )preferred_language=(ja|en)(?:;|$)/);
    if (match && match[1]) return match[1];
  } catch {
    // fallback
  }
  return "en";
}

function saveLanguageCookie(lang) {
  if (typeof document === "undefined") return;
  try {
    // Persist for 1 year
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `preferred_language=${lang}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Language Provider — wraps the app to provide global i18n context.
 * Stores current language ("en" | "ja") and provides:
 *   - lang: current language code
 *   - toggleLang(): switches between en ↔ ja
 *   - setLang(): changes language and shows BrandLoader for seamless re-render
 *   - t(key): returns translated string for dot-notation key (e.g. "navbar.career")
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [isMounted, setIsMounted] = useState(false);
  const [isLangSwitching, setIsLangSwitching] = useState(false);
  const switchTimerRef = useRef(null);

  // Sync saved language preference on mount (runs strictly on client)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferred_language");
      if (saved === "ja" || saved === "en") {
        setLangState(saved);
        saveLanguageCookie(saved);
      } else {
        const match = document.cookie.match(/(?:^|; )preferred_language=(ja|en)(?:;|$)/);
        if (match && (match[1] === "ja" || match[1] === "en")) {
          setLangState(match[1]);
        }
      }
    } catch {
      // localStorage may be disabled or restricted in private browsing
    } finally {
      setIsMounted(true);
    }
  }, []);

  const setLang = useCallback((newLang, suppressLoader = false) => {
    setLangState((prev) => {
      if (prev === newLang) return prev;

      try {
        localStorage.setItem("preferred_language", newLang);
        saveLanguageCookie(newLang);
      } catch {
        // ignore storage errors
      }

      if (suppressLoader) {
        return newLang;
      }

      setIsLangSwitching(true);

      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

      switchTimerRef.current = setTimeout(() => {
        setIsLangSwitching(false);
        // Refresh GSAP ScrollTrigger calculations after language content resize
        if (typeof window !== "undefined") {
          setTimeout(() => {
            if (typeof ScrollTrigger !== "undefined") {
              ScrollTrigger.refresh();
            }
            window.dispatchEvent(new Event("resize"));
            window.dispatchEvent(new Event("navbar-change"));
            window.dispatchEvent(new Event("scroll"));
          }, 50);
        }
      }, 500);

      return newLang;
    });
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const nextLang = prev === "en" ? "ja" : "en";

      try {
        localStorage.setItem("preferred_language", nextLang);
        saveLanguageCookie(nextLang);
      } catch {
        // ignore storage errors
      }

      setIsLangSwitching(true);

      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

      switchTimerRef.current = setTimeout(() => {
        setIsLangSwitching(false);
        if (typeof window !== "undefined") {
          setTimeout(() => {
            if (typeof ScrollTrigger !== "undefined") {
              ScrollTrigger.refresh();
            }
            window.dispatchEvent(new Event("resize"));
            window.dispatchEvent(new Event("navbar-change"));
            window.dispatchEvent(new Event("scroll"));
          }, 50);
        }
      }, 500);

      return nextLang;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    };
  }, []);

  /**
   * Resolve a dot-notation key like "navbar.who_we_are" from the current
   * language's translation object. Falls back to English, then to the raw key.
   */
  const t = useCallback(
    (key) => {
      const resolve = (obj, path) => {
        return path.split(".").reduce((acc, part) => {
          if (acc && typeof acc === "object" && part in acc) return acc[part];
          return undefined;
        }, obj);
      };

      const result = resolve(translations[lang], key);
      if (result !== undefined) return result;

      // Fallback to English
      const fallback = resolve(translations.en, key);
      if (fallback !== undefined) return fallback;

      return key; // Last resort: return the key itself
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isLangSwitching }}>
      {!isMounted ? (
        <BrandLoader fullScreen />
      ) : isLangSwitching ? (
        <BrandLoader
          fullScreen
          label={lang === "ja" ? "言語を切り替えています…" : "Switching Language…"}
        />
      ) : null}
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook to access language state and toggle function */
export function useLanguage() {
  return useContext(LanguageContext);
}