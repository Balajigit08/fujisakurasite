

import AIServicesHeader from "./header/page";
import AIServeProvide from "./serve-provide/page";

export default function AIServicesPage() {
    return (
        <main data-navbar="light" className="overflow-x-hidden w-full max-w-[2050px] mx-auto min-h-screen bg-white">
            <AIServicesHeader />
            <AIServeProvide />
        </main>
    );
}