"use client";

import { useState, useEffect, useRef } from "react";

/**
 * LazySection defers mounting heavy below-the-fold client components
 * until either:
 * 1. The user scrolls near it (IntersectionObserver with 600px margin)
 * 2. The user initiates any interaction (scroll, touch, wheel, click)
 * 3. The browser is idle (requestIdleCallback / 2500ms safety timer)
 *
 * This ensures the initial JavaScript main thread execution is near-zero (TBT < 200ms)
 * while preserving seamless animations and zero visual disruption when scrolling.
 */
export default function LazySection({
    children,
    minHeight = "400px",
    className = "",
    id,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isVisible) return;

        let idleTimer = null;
        let observer = null;

        const trigger = () => {
            setIsVisible(true);
            cleanup();
        };

        const cleanup = () => {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (idleTimer) {
                clearTimeout(idleTimer);
                if (typeof window !== "undefined" && window.cancelIdleCallback) {
                    window.cancelIdleCallback(idleTimer);
                }
                idleTimer = null;
            }
            window.removeEventListener("scroll", trigger);
            window.removeEventListener("touchstart", trigger);
            window.removeEventListener("wheel", trigger);
            window.removeEventListener("pointerdown", trigger);
        };

        // 1. User interaction trigger (instant response)
        window.addEventListener("scroll", trigger, { passive: true, once: true });
        window.addEventListener("touchstart", trigger, { passive: true, once: true });
        window.addEventListener("wheel", trigger, { passive: true, once: true });
        window.addEventListener("pointerdown", trigger, { passive: true, once: true });

        // 2. IntersectionObserver trigger (mounts 800px before section enters viewport)
        if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        trigger();
                    }
                },
                { rootMargin: "800px 0px" }
            );
            observer.observe(containerRef.current);
        }

        return cleanup;
    }, [isVisible]);

    return (
        <div
            ref={containerRef}
            id={id}
            className={className}
            style={!isVisible ? { minHeight } : undefined}
        >
            {isVisible ? children : null}
        </div>
    );
}
