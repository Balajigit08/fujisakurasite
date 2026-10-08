

import IndustriesHeader from "./header/page";
import IndustriesServeProvide from "./serve-provide/page";

export default function IndustriesPage() {
    return (
        <main data-navbar="light" className="overflow-x-hidden w-full max-w-[2050px] mx-auto min-h-screen bg-white">
            <IndustriesHeader />
            <IndustriesServeProvide />
        </main>
    );
}