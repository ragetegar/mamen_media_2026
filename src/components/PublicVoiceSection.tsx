import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { getArticleHref } from "@/lib/article-taxonomy";
import { Article } from "@/lib/types";

interface PublicVoiceSectionProps {
    articles: Article[];
}

export default function PublicVoiceSection({ articles }: PublicVoiceSectionProps) {
    const featured = articles[0];
    const secondary = articles.slice(1, 5);

    if (!featured) return null;

    return (
        <section className="bg-mamen-gray-900 py-16 md:py-20 border-y-4 border-mamen-lime">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    title="PUBLIC"
                    highlight="VOICE"
                    seeAllHref="/public-voice"
                    seeAllLabel="Lihat Semua →"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <Link href={getArticleHref(featured)} className="lg:col-span-7 lg:sticky lg:top-24 group block">
                        <article className="card-frame overflow-hidden">
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <Image
                                    src={featured.cover_image}
                                    alt={featured.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                />
                            </div>
                            <div className="p-5 md:p-6">
                                <p className="font-headline text-xs font-bold tracking-widest text-mamen-lime uppercase">
                                    Suara Utama
                                </p>
                                <h2 className="mt-2 font-headline text-2xl md:text-3xl font-black leading-tight text-mamen-white group-hover:text-mamen-purple transition-colors">
                                    {featured.title}
                                </h2>
                                <p className="mt-3 text-sm text-mamen-gray-200 leading-relaxed line-clamp-2">
                                    {featured.excerpt}
                                </p>
                            </div>
                        </article>
                    </Link>

                    <div className="lg:col-span-5 border-4 border-mamen-white bg-mamen-black">
                        {secondary.length > 0 ? secondary.map((article, index) => (
                            <Link
                                key={article.id}
                                href={getArticleHref(article)}
                                className={`group block p-5 md:p-6 ${index > 0 ? "border-t-2 border-mamen-gray-800" : ""}`}
                            >
                                <h3 className="font-headline text-lg font-bold leading-tight text-mamen-white group-hover:text-mamen-lime transition-colors">
                                    {article.title}
                                </h3>
                                <p className="mt-2 text-sm text-mamen-gray-200 leading-relaxed line-clamp-2">
                                    {article.excerpt}
                                </p>
                            </Link>
                        )) : (
                            <div className="h-full min-h-56 flex items-center p-6">
                                <div>
                                    <p className="font-headline text-sm font-bold tracking-widest text-mamen-lime uppercase">
                                        Public Voice
                                    </p>
                                    <p className="mt-3 text-sm text-mamen-gray-200 leading-relaxed">
                                        Cerita, keresahan, dan suara publik lainnya akan hadir di kolom ini.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
