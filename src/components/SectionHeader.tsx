import Link from "next/link";

interface SectionHeaderProps {
    title: string;
    highlight?: string;
    seeAllHref?: string;
    seeAllLabel?: string;
}

export default function SectionHeader({
    title,
    highlight,
    seeAllHref,
    seeAllLabel = "See All →",
}: SectionHeaderProps) {
    return (
        <div className="flex items-end justify-between mb-8">
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-mamen-white">
                {title}{" "}
                {highlight && <span className="text-mamen-magenta">{highlight}</span>}
            </h2>
            {seeAllHref && (
                <Link
                    href={seeAllHref}
                    className="hidden sm:block font-headline text-xs font-bold tracking-widest text-mamen-gray-200 hover:text-mamen-lime transition-colors uppercase"
                >
                    {seeAllLabel}
                </Link>
            )}
        </div>
    );
}
