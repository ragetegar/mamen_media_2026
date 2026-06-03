"use client";

import Image from "next/image";
import { ArticleProduct } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface AffiliateProductTileProps {
    product: ArticleProduct;
}

const merchantStyles: Record<string, { bg: string; label: string }> = {
    shopee: { bg: "merchant-shopee", label: "Shopee" },
    tokopedia: { bg: "merchant-tokopedia", label: "Tokopedia" },
    tiktok: { bg: "merchant-tiktok", label: "TikTok Shop" },
};

export default function AffiliateProductTile({ product }: AffiliateProductTileProps) {
    const merchant = merchantStyles[product.merchant] || { bg: "", label: product.merchant };

    return (
        <div className="card-frame overflow-hidden hover:-translate-y-1 transition-transform group">
            <div className="flex flex-col sm:flex-row">
                {/* Product Image */}
                <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto shrink-0 bg-mamen-gray-100">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 160px"
                    />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                        <h4 className="font-headline text-sm font-bold text-mamen-white leading-tight group-hover:text-mamen-purple transition-colors">
                            {product.title}
                        </h4>
                        <p className="mt-1 font-bold text-xl text-mamen-purple">{product.price_display}</p>
                        <span
                            className={`inline-block mt-2 text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 ${merchant.bg}`}
                        >
                            Available on {merchant.label}
                        </span>
                    </div>

                    <a
                        href={`/go/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 sm:mt-0 flex items-center justify-center gap-2 bg-mamen-lime text-mamen-black font-headline font-bold text-xs uppercase tracking-wider px-4 py-3 border-2 border-mamen-white shadow-hard-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_var(--shadow-color)] transition-all duration-150 sm:w-fit self-end"
                    >
                        Check Price
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
}
