import { notFound } from "next/navigation";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import AffiliateProductTile from "@/components/AffiliateProductTile";
import ArticleTile from "@/components/ArticleTile";
import ConcertTile from "@/components/ConcertTile";
import {
    getArticleBySlug,
    getArticleProducts,
    getRelatedArticles,
    getArticleLinkedConcerts,
} from "@/lib/data";
import { Copy, Share2 } from "lucide-react";
import ArticlePageClient from "@/app/media/[slug]/ArticlePageClient";
import { Article, ArticleCategory } from "@/lib/types";

const categoryBadgeVariant: Record<string, "lime" | "magenta" | "purple"> = {
    music: "purple",
    concerts: "magenta",
    lifestyle: "lime",
    sports: "magenta",
    hobbies: "lime",
};

interface ArticleDetailPageProps {
    slug: string;
    expectedCategory?: ArticleCategory;
}

export default async function ArticleDetailPage({ slug, expectedCategory }: ArticleDetailPageProps) {
    const article = await getArticleBySlug(slug);
    if (!article) notFound();

    // If expectedCategory is set, validate the article belongs to this category
    if (expectedCategory && article.category !== expectedCategory) {
        notFound();
    }

    const products = await getArticleProducts(article.id);
    const relatedArticles = await getRelatedArticles(article.slug, 3);
    const linkedConcerts = await getArticleLinkedConcerts(article);

    return (
        <>
            {/* Hero Cover */}
            <section className="relative">
                <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                    <Image
                        src={article.cover_image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mamen-black via-mamen-black/60 to-transparent" />
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                        <Badge variant={categoryBadgeVariant[article.category] || "lime"} className="mb-4">
                            {article.category}
                        </Badge>
                        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] text-mamen-white">
                            {article.title}
                        </h1>
                        <div className="mt-4 flex items-center gap-4 text-sm text-mamen-gray-200">
                            <span className="font-medium">{article.author}</span>
                            <span>•</span>
                            <time>
                                {article.published_at ? new Date(article.published_at).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                }) : 'Draft'}
                            </time>
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {article.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs px-2.5 py-1 bg-mamen-gray-900/80 text-mamen-gray-200 font-headline tracking-wide uppercase border border-mamen-gray-700 backdrop-blur-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Article Body */}
            <section className="bg-mamen-black py-12 md:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        className="prose prose-invert prose-lg max-w-none
              [&_h2]:font-headline [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-mamen-lime [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:mt-10 [&_h2]:mb-4
              [&_p]:text-mamen-gray-100 [&_p]:leading-relaxed [&_p]:mb-6
              [&_strong]:text-mamen-white
              [&_a]:text-mamen-purple [&_a]:underline [&_a]:hover:text-mamen-magenta"
                        dangerouslySetInnerHTML={{ __html: article.body_html }}
                    />

                    {/* Affiliate Products */}
                    {products.length > 0 && (
                        <div className="mt-12 pt-8 border-t-4 border-mamen-purple">
                            <h2 className="font-headline text-2xl font-bold text-mamen-white uppercase tracking-wide mb-6">
                                Featured <span className="text-mamen-magenta">Products</span>
                            </h2>
                            <div className="space-y-4">
                                {products.map((product) => (
                                    <AffiliateProductTile key={product.id} product={product} />
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-mamen-gray-700">
                                <span className="text-mamen-magenta font-bold">Affiliate:</span> Links above may
                                earn us a commission. This doesn&apos;t affect our editorial independence.
                            </p>
                        </div>
                    )}

                    {/* Linked Concerts */}
                    {linkedConcerts.length > 0 && (
                        <div className="mt-12 pt-8 border-t-4 border-mamen-magenta">
                            <h2 className="font-headline text-2xl font-bold text-mamen-white uppercase tracking-wide mb-2">
                                🎤 Related <span className="text-mamen-magenta">Concerts</span>
                            </h2>
                            <p className="text-sm text-mamen-gray-200 mb-6">
                                This article talks about these upcoming events — grab your tickets!
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {linkedConcerts.map((concert) => (
                                    <ConcertTile key={concert.id} concert={concert} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div className="mt-12 pt-8 border-t border-mamen-gray-800">
                        <h3 className="font-headline text-sm font-bold tracking-widest text-mamen-gray-200 uppercase mb-4">
                            Share This Article
                        </h3>
                        <div className="flex gap-3 flex-wrap">
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(article.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-[#25D366] text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                            >
                                WhatsApp
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-mamen-black text-mamen-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-white shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Share2 size={12} /> Post on X
                                </span>
                            </a>
                            <button
                                className="px-4 py-2 bg-mamen-gray-800 text-mamen-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-gray-700 shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Copy size={12} /> Copy Link
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Comments */}
                    <ArticlePageClient articleId={article.id} />
                </div>
            </section>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="bg-mamen-gray-900 py-12 md:py-16 border-t-4 border-mamen-purple">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-headline text-3xl font-black text-mamen-white mb-8">
                            MORE <span className="text-mamen-lime">READS</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedArticles.map((a) => (
                                <ArticleTile key={a.id} article={a} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
