

import React from "react";
import ServeProvideCarousel from "@/app/components/common/ServeProvideCarousel";
import { DOMAINS } from "../data/industriesData";

export default function IndustriesServeProvide() {
    return (
        <ServeProvideCarousel
            id="industries-cards-section"
            items={DOMAINS}
            i18nNamespace="industries_list"
            cardClassName="industry-card"
            bgColor="bg-[#D6EEF7]"
        />
    );
}
