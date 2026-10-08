"use client"
import LocationScroll from './LocationScroll';
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function InformationPage() {
    const { t } = useLanguage();

    const JAPAN_DATA = [
        { title: t('information.name_of'), desc: t('information.japan_company_name') },
        { title: t('information.date_of_establishment'), desc: t('information.japan_establishment_date') },
        { title: t('information.directors_label'), desc: [t('directors.satheesh_chelliah_full'), t('directors.satheeshkannan_chandrasekaran_full'), t('directors.madhavaramanujam_rajendran_full')] },
        { title: t('information.representative_director'), desc: t('directors.yozo_minowa_full') },
    ];

    const INDIA_DATA = [
        { title: t('information.name_of'), desc: t('information.india_company_name') },
        { title: t('information.date_of_establishment'), desc: t('information.india_establishment_date') },
        { title: t('information.directors_label'), desc: [t('directors.satheesh_chelliah_full'), t('directors.satheeshkannan_chandrasekaran_full'), t('directors.madhavaramanujam_rajendran_full'), t('directors.pazhamalai_jagadeesan_full')] },
    ];

    return (
        <div data-navbar="light" className="w-full bg-[#f8fafc] overflow-hidden">
            <div className="relative z-10">
                <LocationScroll
                    country={t('information.country_japan')}
                    mapImage="map-japan"
                    blocks={JAPAN_DATA}
                    pinPosition="left-[88%] top-[45%] md:left-[88%] md:top-[52%] 2xl:left-[89.7%] 2xl:top-[51.9%]"
                    overlapNext={true}
                />
            </div>
            <div className="relative z-20 lg:-mt-[100vh] mt-0 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[3rem] bg-white">
                <LocationScroll
                    country={t('information.country_india')}
                    mapImage="map-india1"
                    blocks={INDIA_DATA}
                    pinPosition="left-[73%] top-[56%] md:left-[76.2%] md:top-[60%] 2xl:left-[77.6%] 2xl:top-[62.5%]"
                />
            </div>
        </div>
    );
}