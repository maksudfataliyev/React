"use client";
import { useMobile } from "@/hooks/use-mobile";
import { useTablet } from "@/hooks/use-tablet";
import Image from "next/image";

interface DestinationCardProps {
    id: number;
    image: string;
    title: string;
    description: string;
    traveler: {
        status: string;
        name: string;
        image: string;
    };
    height?: number;
}

export default function DestinationCard({ id, image, title, description, traveler, height = 600 }: DestinationCardProps) {

    const isMobile = useMobile();
    const isTablet = useTablet();
    const marginTop = isMobile || isTablet ? 0 : id % 5 === 0 ? -250 : 0;

    return (
        <div className="rounded-[80px] relative" style={{ height: `${height}px`, marginTop: marginTop }} >
            <Image src={image} alt={title} width={100} height={height} className="w-full h-full object-cover rounded-[80px] absolute inset-0" />
            <div className="flex flex-col justify-between relative z-10 h-full py-12 px-8">

                <div className="flex flex-col gap-2 max-w-[286px]">
                    <h3 className="text-4xl font-bold text-white">{title}</h3>
                    <p className="text-md text-white ">{description}</p>
                </div>

                <div className="flex items-center gap-4">
                    <Image src={traveler.image} alt={traveler.name} width={120} height={120} className="w-10 h-10 rounded-full" />
                    <div className="flex flex-col">
                        <h6 className="text-sm text-white font-bold">{traveler.name}</h6>
                        <p className="text-sm text-white">{traveler.status}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}