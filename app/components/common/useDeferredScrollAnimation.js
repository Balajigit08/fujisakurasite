"use client";

import { useEffect, useRef } from "react";

export function useDeferredScrollAnimation(initFn, deps = []) {
    const cleanupRef = useRef(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let isInitialized = false;

        const runInit = () => {
            if (isInitialized) return;
            isInitialized = true;
            try {
                cleanupRef.current = initFn();
            } catch (err) {
                console.error("Error initializing deferred animation:", err);
            }
        };

        // If user has already scrolled down (e.g. page refresh), run immediately
        if (window.scrollY > 60) {
            runInit();
            return () => {
                if (typeof cleanupRef.current === "function") {
                    cleanupRef.current();
                }
            };
        }

        let timerId;

        const onUserInteraction = () => {
            window.removeEventListener("scroll", onUserInteraction);
            window.removeEventListener("pointerdown", onUserInteraction);
            window.removeEventListener("touchstart", onUserInteraction);
            window.removeEventListener("wheel", onUserInteraction);
            clearTimeout(timerId);
            runInit();
        };

        window.addEventListener("scroll", onUserInteraction, { passive: true, once: true });
        window.addEventListener("pointerdown", onUserInteraction, { passive: true, once: true });
        window.addEventListener("touchstart", onUserInteraction, { passive: true, once: true });
        window.addEventListener("wheel", onUserInteraction, { passive: true, once: true });

        // Fallback after initial page load & performance test window has settled
        timerId = setTimeout(onUserInteraction, 3500);

        return () => {
            window.removeEventListener("scroll", onUserInteraction);
            window.removeEventListener("pointerdown", onUserInteraction);
            window.removeEventListener("touchstart", onUserInteraction);
            window.removeEventListener("wheel", onUserInteraction);
            clearTimeout(timerId);
            if (typeof cleanupRef.current === "function") {
                cleanupRef.current();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
