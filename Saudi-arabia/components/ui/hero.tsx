"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

interface HeroProps {
    image: string;
    title: string;
    description: string;
}
export default function Hero({image, title, description}: HeroProps) {
    const pathname = usePathname();

    return (
        <section className="z-0 min-h-[720px] ">
            <Image src={image} alt="explore" fill className="w-full min-h-[600px] lg:min-h-[982px] object-cover" />
            <div className="absolute inset-0 bg-black/40 w-full min-h-[600px] lg:min-h-[982px]" />
            <div className="container mx-auto relative z-10 flex flex-col items-center mt-[122px] h-full">
                <h1 className="text-[98px] font-extrabold text-white max-w-[650px] text-center leading-[100px]">{title}</h1>
                <p className="text-white text-xl max-w-[576px] text-center">{description}</p>

                {(pathname === "/") && (
                    <div className="flex justify-between mt-20 w-full">
                        <div className="flex flex-col gap-4 max-w-[331px]">
                            <h4 className="text-[32px] font-bold text-white">History and Heritage</h4>
                            <p className="text-white text-md max-w-[276px]">
                                Saudi Arabia has long occupied an
                                important role at the center of the
                                islamic and Arab worlds. Located at
                                the heart of three continents.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 max-w-[331px]">
                            <h4 className="text-[32px] font-bold text-white">People and Culture</h4>
                            <p className="text-white text-md max-w-[276px]">
                                Saudi Arabia has a rich Culture
                                Shaped by the diversity of its people.
                                which has formed the basis of its
                                cultural identity.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}