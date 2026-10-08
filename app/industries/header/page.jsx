"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import PageHeader from "@/app/components/common/PageHeader";

export default function IndustriesHeader() {
    const { t } = useLanguage();

    return (
        <PageHeader
            id="industries-header-section"
            titlePrefix={t("industries_page.our")}
            titleHighlight={t("industries_page.industries")}
            leftImage={{
                src: "industries-top-left",
                alt: "Industries showcase left",
            }}
            rightImage={{
                src: "industries-top-right",
                alt: "Industries showcase right",
            }}
            descriptions={[
                t("industries_page.desc_1"),
                t("industries_page.desc_2"),
            ]}
        />
    );
}