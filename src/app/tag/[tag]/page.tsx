import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleHref, getArticleSubcategoryLabel } from "@/lib/article-taxonomy";
import { getArticlesByTag } from "@/lib/data";
import { normalizeArticleTag } from "@/lib/tags";
import { formatDate } from "@/lib/format";

interface TagPageProps {
    params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
    const { tag: rawTag } = await params;
    const tag = normalizeArticleTag(rawTag);

    if (!tag) return { title: "Tag Not Found" };

    return {
        title: `#${tag}`,
        description: `Latest MAMEN articles tagged #${tag}.`,
    };
}

export default async function TagPage({ params }: TagPageProps) {
    const { tag: rawTag } = await params;
    const tag = normalizeArticleTag(rawTag);
    if (!tag) notFound();

    const articles = await getArticlesByTag(tag);

    return (
        <>
            <section className="border-b-4 border-mamen-purple bg-mamen-black py-12 md:py-16">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <p className="font-headline text-xs font-bold uppercase tracking-[0.25em] text-mamen-gray-200">
                        Article Tag
                    </p>
                    <h1 className="mt-2 font-headline text-5xl font-black text-mamen-lime md:text-7xl">
                        #{tag}
                    </h1>
                    <p className="mt-4 text-sm text-mamen-gray-200">
                        {articles.length} published {articles.length === 1 ? "article" : "articles"}
                    </p>
                </div>
            </section>

            <section className="min-h-[50vh] bg-mamen-black py-10 md:py-14">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {articles.length > 0 ? (
                        <div className="border-t-4 border-mamen-white">
                            {articles.map((article) => (
                                <article key={article.id} className="border-b-2 border-mamen-gray-700 py-6">
                                    <Link href={getArticleHref(article)} className="group block">
                                        <div className="mb-2 flex flex-wrap items-center gap-2 font-headline text-xs font-bold uppercase tracking-widest text-mamen-gray-200">
                                            <span>{getArticleSubcategoryLabel(article)}</span>
                                            <span className="text-mamen-purple">/</span>
                                            <time>
                                                {article.published_at
                                                    ? formatDate(article.published_at, {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "Draft"}
                                            </time>
                                        </div>
                                        <h2 className="font-headline text-2xl font-black leading-tight text-mamen-white transition-colors group-hover:text-mamen-purple md:text-3xl">
                                            {article.title}
                                        </h2>
                                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mamen-gray-200 line-clamp-2">
                                            {article.excerpt}
                                        </p>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="border-4 border-dashed border-mamen-gray-800 py-16 text-center">
                            <p className="font-headline text-2xl font-bold text-mamen-gray-700">
                                No published articles tagged #{tag} yet.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
