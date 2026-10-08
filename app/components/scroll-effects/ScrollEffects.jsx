"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.remove("gsap-hidden");
  }, [pathname]);

  return null;
}