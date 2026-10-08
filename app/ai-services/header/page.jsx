"use client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import PageHeader from "@/app/components/common/PageHeader";

export default function AIServicesHeader() {
    const { t } = useLanguage();

    return (
        <PageHeader
            id="ai-services-header-section"
            titlePrefix={t("ai_services_page.title_prefix")}
            titleHighlight={t("ai_services_page.title_highlight")}
            leftImage={{
                src: "ai-service-top-left",
                alt: "AI Service Left Banner",
            }}
            rightImage={{
                src: "ai-service-top-right",
                alt: "AI Service Right Banner",
            }}
            descriptions={[
                t("ai_services_page.desc_1"),
            ]}
        />
    );
}
