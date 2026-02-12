import Image from "next/image";
import Link from "next/link";


export default function Navbar() {
    return (
        <nav className="container mx-auto flex justify-between items-center py-4 relative z-50">
            <Link href="/">
                <Image src="/logo.png" alt="logo" width={213} height={118} />
            </Link>
            <ul className="flex gap-14">
                <Link href="/destenations" className="text-2xl font-medium text-white">
                    Destenations
                </Link>
                <Link href="/members" className="text-2xl font-medium text-white">
                    Members
                </Link>
                <Link href="/gallery" className="text-2xl font-medium text-white">
                    Gallery
                </Link>
            </ul>

        </nav>
    )
}