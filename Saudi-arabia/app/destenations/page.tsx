import Hero from "@/components/ui/hero";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Destenations",
    description: "Discover the country's hidden gems and breathtaking landscapes",
};

export default function Destenations() {

    return (
        <div>
            <Hero
                image="/destenations.png"
                title="Destenations"
                description="Saudi Arabia is rich in heritage and history. The country is 
                    home to hundreds of historically important sites." />
        </div>
    )
}