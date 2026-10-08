"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const getLocalImageUrl = ({ src }) => `/FS-images/${src}.jpg`;

const ROUTES_TO_PRELOAD = [
  "/about",
  "/we-do",
  "/industries",
  "/ai-services",
  "/career",
  "/contact",
];

const HERO_IMAGE_IDS = [
  "what-we-do-top-left",
  "what-we-do-top-right",
  "industries-top-left",
  "industries-top-right",
  "ai-service-top-left",
  "ai-service-top-right",
  "career-top",
  "career-small",
  "career-big",
];

export default function RoutePreloader({ isHomeReady }) {
  const router = useRouter();
  const hasPreloadedRef = useRef(false);

  useEffect(() => {
    // Only run after the initial Home load / loader is complete
    if (!isHomeReady || hasPreloadedRef.current) return;
    hasPreloadedRef.current = true;

    const performPreload = () => {
      // 1. Next.js Route Prefetching
      ROUTES_TO_PRELOAD.forEach((route) => {
        try {
          router.prefetch(route);
        } catch {
          // Ignore prefetch errors in unsupported environments
        }
      });

      // 2. Pre-warm above-the-fold hero images from local paths
      if (typeof window !== "undefined") {
        HERO_IMAGE_IDS.forEach((id) => {
          try {
            const url = getLocalImageUrl({ src: id });
            if (url) {
              const img = new Image();
              img.src = url;
            }
          } catch {
            // Silently ignore if image pre-warm fails
          }
        });
      }
    };

    let timerId;

    const triggerPreload = () => {
      window.removeEventListener("scroll", triggerPreload);
      window.removeEventListener("pointerdown", triggerPreload);
      window.removeEventListener("touchstart", triggerPreload);

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(performPreload, { timeout: 3000 });
      } else {
        setTimeout(performPreload, 1000);
      }
    };

    // Preload on first user interaction (scroll, touch, click)
    window.addEventListener("scroll", triggerPreload, { passive: true, once: true });
    window.addEventListener("pointerdown", triggerPreload, { passive: true, once: true });
    window.addEventListener("touchstart", triggerPreload, { passive: true, once: true });

    return () => {
      window.removeEventListener("scroll", triggerPreload);
      window.removeEventListener("pointerdown", triggerPreload);
      window.removeEventListener("touchstart", triggerPreload);
    };
  }, [isHomeReady, router]);

  return null;
}
