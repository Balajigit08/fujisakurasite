"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/app/navbar/page";
import RoutePreloader from "@/app/components/preloader/RoutePreloader";
import LazySection from "@/app/components/common/LazySection";

const Footer = dynamic(() => import("@/app/footer/page"), { ssr: false });

let isFirstLoad = true;

export default function ConditionalShell({ children }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname === "/admin";

  return (
    <>
      <RoutePreloader isHomeReady={true} />
      {isLoginPage ? (
        children
      ) : isAdminPage ? (
        <>
          <Navbar />
          {children}
        </>
      ) : (
        <>
          <Navbar />
          {children}
          <LazySection minHeight="400px">
            <Footer />
          </LazySection>
        </>
      )}
    </>
  );
}
