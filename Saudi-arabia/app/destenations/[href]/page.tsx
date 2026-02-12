import { Destenation } from "@/types/destenation.type";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
    params: {
        href: string;
    }
}

export default async function DestenationPage({ params }: PageProps) {
    const { href } = await params;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/destenations`);

    if (!response.ok) {
        return notFound();
    }

    const destenations: Destenation[] = await response.json();

    const destenation = destenations.find((destenation) => destenation.href === `/destenations/${href}`);
    if (!destenation) {
        return notFound();
    }

    console.log(destenation);

    return (
        <div>
            <h1>{destenation.title}</h1>
            <p>{destenation.description}</p>
            <Image src={destenation.image} alt={destenation.title} width={1000} height={1000} />
        </div>
    )
}