import Image from "next/image";
import Link from "next/link";
import type { HomepageSponsor } from "@/lib/types";

interface HomepageSponsorsProps {
    sponsors: HomepageSponsor[];
}

export default function HomepageSponsors({ sponsors }: HomepageSponsorsProps) {
    if (sponsors.length === 0) return null;

    return (
        <section className="bg-mamen-black pb-4 md:pb-6">
            <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:px-8">
                {sponsors.map((sponsor) => {
                    const isExternal = sponsor.link?.startsWith("http");

                    return (
                        <Link
                            key={sponsor.id}
                            href={sponsor.link || "/"}
                            className="group relative block aspect-[16/5] overflow-hidden bg-mamen-gray-900 sm:aspect-[5/1]"
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "sponsored noopener noreferrer" : undefined}
                        >
                            <Image
                                src={sponsor.image}
                                alt={sponsor.alt_text || sponsor.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                                sizes="(max-width: 1280px) 100vw, 1280px"
                            />
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
