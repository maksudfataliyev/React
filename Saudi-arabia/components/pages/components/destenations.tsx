'use client';
import DestinationCard from "@/components/ui/destination-card";
import SectionHeader from "./section-header";
import { useMobile } from "@/hooks/use-mobile";
import { useTablet } from "@/hooks/use-tablet";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Destenation } from "@/types/destenation.type";



export default function Destenations() {
    const [destenations, setDestenations] = useState<Destenation[]>([]);

    useEffect(() => {
        const fetchDestenations = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/destenations`);
            if (!response.ok) {
                return;
            }
            const data: Destenation[] = await response.json();
            setDestenations(data);
        }
        fetchDestenations();
    }, [])

    const isMobile = useMobile();
    const isTablet = useTablet();

    if (isMobile || isTablet) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                {
                    destenations.map((destination) => (
                        <Link href={destination.href}  // <a href={destination.href}>
                            key={destination.id}
                        >
                            <DestinationCard
                                {...destination}
                                height={420}
                            />
                        </Link>
                    ))
                }
            </div>
        )
    }


    return (
        <section className="mt-12 container mx-auto">
            <SectionHeader
                title="Best Destinations"
                description="Explore the enchanting landscapes of saudi Arabia, from
                            the breathtaking deserts to the stunning coastal shores."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                {
                    destenations.map((destination, index) => (
                        <Link href={destination.href} key={destination.id}>
                            <DestinationCard
                                {...destination}
                                height={index % 2 === 0 ? 672 : 420}
                            />
                        </Link>
                    ))
                }


            </div>
        </section>
    )
}