"use client"

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import PageHeader from "@/app/components/common/PageHeader";

export default function AboutHeader() {
    const { t } = useLanguage();

    return (
        <PageHeader
            id="about-header-section"
            titlePrefix={t("about.about_label")}
            titleHighlight={t("about.fujisakura")}
            subhead={t("about.about_subhead")}
            leftImage={{
                src: "what-we-do-top-left",
                alt: "Team collaborating in modern office",
            }}
            rightImage={{
                src: "what-we-do-top-right",
                alt: "Modern tech workspace background",
            }}
            descriptions={[
                t("about.desc_1"),
                t("about.desc_2"),
                t("about.desc_3"),
            ]}
        />
    );
}
