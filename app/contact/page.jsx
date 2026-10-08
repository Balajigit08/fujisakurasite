import Header from "./header/page";
import Form from "./form/page";
import Address from "./address/page";

export default function ContactPage() {
    return (
        <main data-navbar="light" className="overflow-x-hidden w-full max-w-[2050px] mx-auto min-h-screen bg-white">
            <Header />
            <Form />
            <Address />
        </main>
    );
}
