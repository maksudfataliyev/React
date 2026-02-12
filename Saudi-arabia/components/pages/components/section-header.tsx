interface SectionHeaderProps {
    title: string;
    description: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
    return (
        <div className="max-w-[566px] mx-auto text-center">
            <h2 className="text-[40px] font-bold text-white">{title}</h2>
            <p className="text-[20px] text-white">{description}</p>
        </div>
    )
}

