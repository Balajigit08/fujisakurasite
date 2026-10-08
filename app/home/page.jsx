"use client";

import dynamic from "next/dynamic";
import HeroAndAbout from "../components/hero-and-about/HeroAndAbout";
import LazySection from "../components/common/LazySection";

const Provide = dynamic(() => import("./provides/page"), { ssr: false });
const OurValues = dynamic(() => import("./ourvalues/page"), { ssr: false });
const Domains = dynamic(() => import("./domains/page"), { ssr: false });
const Directors = dynamic(() => import("./ourdirectors/page"), { ssr: false });
const Testimonial = dynamic(() => import("./testimonial/testimonial"), { ssr: false });

export default function Home() {
    return (
        <div className="w-full">
            <HeroAndAbout />
            <LazySection minHeight="600px">
                <Provide />
            </LazySection>
            <LazySection minHeight="600px">
                <OurValues />
            </LazySection>
            <LazySection minHeight="600px">
                <Domains />
            </LazySection>
            <LazySection minHeight="600px">
                <Directors />
            </LazySection>
            <LazySection minHeight="600px">
                <Testimonial />
            </LazySection>
        </div>
    );
}