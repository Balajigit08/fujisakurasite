
import ServeProvideCarousel from "@/app/components/common/ServeProvideCarousel";
import { AI_SERVICES } from "../data/servicesData";

export default function AIServeProvide() {
    return (
        <ServeProvideCarousel
            id="ai-serve-provide-cards-section"
            items={AI_SERVICES}
            i18nNamespace="ai_services_list"
            cardClassName="ai-service-card"
            bgColor="bg-[#D6EEF7]"
        />
    );
}
