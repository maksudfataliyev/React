import { Card } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem
} from "@/components/ui/carousel"
import Image from "next/image"

const images = [
    "/saudia.png",
    "/alrajni_bank.png",
    "/stc.png",
    "/almari.png"
]

export function CarouselSlider() {
    return (
        <Carousel className="w-full container mx-auto" opts={{ loop: true, align: "center", dragFree: true,  }}>
            <CarouselContent className="-ml-1 gap-4" >
                {images.map((image, index) => (
                    <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/4 flex items-center justify-center">

                        <Card className="flex items-center justify-center bg-transparent border-none">
                            <Image src={image} alt="carousel" width={290} height={88} className=" object-cover" />
                        </Card>

                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    )
}
