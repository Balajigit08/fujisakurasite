"use client";

import Header from "./header/page";
import Information from "./information/page";
import Milestone from "./milestone/page";
import StickyCards from "./certificate/page";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function About() {
    const { lang } = useLanguage();

    return (
        <main key={lang} className="overflow-x-hidden w-full max-w-[2050px] mx-auto">
            <Header />
            <Information />
            <Milestone />
            <StickyCards />
        </main>
    );
}