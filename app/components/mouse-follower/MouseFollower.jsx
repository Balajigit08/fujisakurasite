"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

export function MouseFollower() {
  const [isPointerFine, setIsPointerFine] = useState(false);
  const followerRef = useRef(null);
  const isEnabledRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
      setIsPointerFine(true);
    }
  }, []);

  useEffect(() => {
    if (!isPointerFine) return;

    const follower = followerRef.current;
    if (!follower) return;

    let cleanup = null;

    const initFollower = () => {
      if (cleanup) return;
      window.removeEventListener("pointermove", initFollower);

      // Center the follower
      gsap.set(follower, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
      });

      // High performance smooth tracking using quickTo with tuned responsive easing
      const xTo = gsap.quickTo(follower, "x", { duration: 0.18, ease: "power2.out" });
      const yTo = gsap.quickTo(follower, "y", { duration: 0.18, ease: "power2.out" });

      let isVisible = false;
      let hasMoved = false;
      let isCurrentlyInteractive = false;

      const isInteractiveElement = (target) => {
        if (!target || !(target instanceof Element)) return false;
        return Boolean(
          target.closest(
            'a, button, input, textarea, select, option, [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="checkbox"], [role="switch"], [tabindex="0"], label, summary, audio, .cursor-pointer'
          )
        );
      };

      const handlePointerMove = (e) => {
        // On first move, snap position directly to pointer so it doesn't fly in from (0,0)
        if (!hasMoved) {
          gsap.set(follower, { x: e.clientX, y: e.clientY });
          hasMoved = true;
        } else {
          xTo(e.clientX);
          yTo(e.clientY);
        }

        const isInteractive = isInteractiveElement(e.target);

        // Only trigger scale / opacity animations when state changes (prevents frame drops)
        if (isInteractive !== isCurrentlyInteractive || !isVisible) {
          isCurrentlyInteractive = isInteractive;
          isVisible = true;

          if (isInteractive) {
            gsap.to(follower, {
              scale: 0,
              opacity: 0,
              duration: 0.18,
              overwrite: "auto",
            });
          } else {
            gsap.to(follower, {
              scale: 1,
              opacity: 1,
              duration: 0.22,
              overwrite: "auto",
            });
          }
        }
      };

      const handlePointerDown = (e) => {
        if (!isInteractiveElement(e.target)) {
          gsap.to(follower, {
            scale: 0.8,
            duration: 0.12,
            overwrite: "auto",
          });
        }
      };

      const handlePointerUp = (e) => {
        if (!isInteractiveElement(e.target)) {
          gsap.to(follower, {
            scale: 1,
            duration: 0.18,
            overwrite: "auto",
          });
        }
      };

      const handleMouseLeave = () => {
        isVisible = false;
        isCurrentlyInteractive = false;
        gsap.to(follower, {
          scale: 0,
          opacity: 0,
          duration: 0.18,
          overwrite: "auto",
        });
      };

      const handleWindowBlur = () => {
        isVisible = false;
        isCurrentlyInteractive = false;
        gsap.to(follower, {
          scale: 0,
          opacity: 0,
          duration: 0.18,
          overwrite: "auto",
        });
      };

      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerdown", handlePointerDown, { passive: true });
      window.addEventListener("pointerup", handlePointerUp, { passive: true });
      window.addEventListener("blur", handleWindowBlur);
      document.addEventListener("mouseleave", handleMouseLeave);

      cleanup = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("blur", handleWindowBlur);
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    window.addEventListener("pointermove", initFollower, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointermove", initFollower);
      if (cleanup) cleanup();
    };
  }, [isPointerFine]);

  if (!isPointerFine) return null;

  return (
    <div
      ref={followerRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[999999] select-none will-change-transform hidden sm:flex items-center justify-center opacity-0 scale-0"
      style={{
        width: "36px",
        height: "36px",
        opacity: 0,
        transform: "scale(0)",
      }}
    >
      {/* Main logo badge — glow via box-shadow (no CSS filter to avoid repaint on each frame) */}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-[#FFC56E] to-[#FF9E2A] shadow-[0_0_12px_4px_rgba(255,181,78,0.35),0_4px_14px_rgba(255,160,40,0.4),0_1px_3px_rgba(0,0,0,0.1)] border border-white/50"
      >
        <Image
          src="/FS-images/Logo-fs.png"
          alt="Logo"
          width={20}
          height={20}
          draggable={false}
          className="w-[20px] h-[20px] object-contain select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
        />
      </div>
    </div>
  );
}

export default MouseFollower;