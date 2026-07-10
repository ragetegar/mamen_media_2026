import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { FeaturedBrand } from "@/lib/types";

interface TopBrandsProps {
    brands: FeaturedBrand[];
}

export default function TopBrands({ brands }: TopBrandsProps) {
    return (
        <section className="bg-mamen-black py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-8">
                    <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-mamen-white">
                        TOP <span className="text-mamen-magenta">BRANDS</span>
                    </h2>
                </div>

                {/* Brand Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {brands.map((brand) => (
                        <Link key={brand.id} href={brand.link} className="group">
                            <div className="border-4 border-mamen-white bg-mamen-gray-900 shadow-hard overflow-hidden transition-all duration-150 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[8px_8px_0px_var(--shadow-color)]">
                                <div className="relative aspect-square">
                                    <Image
                                        src={brand.image}
                                        alt={brand.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                                    />
                                    {brand.tag && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="lime">{brand.tag}</Badge>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 text-center">
                                    <span className="font-headline text-sm font-bold tracking-widest text-mamen-white group-hover:text-mamen-lime transition-colors uppercase">
                                        {brand.name}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
