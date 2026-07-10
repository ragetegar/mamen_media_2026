import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { Article } from "@/lib/types";
import { getArticleHref, getArticleSubcategoryLabel } from "@/lib/article-taxonomy";
import { formatDate } from "@/lib/format";

const categoryBadgeVariant: Record<string, "lime" | "magenta" | "purple" | "white"> = {
    "public-voice": "white",
    music: "purple",
    lifestyle: "lime",
    sports: "magenta",
    gaming: "purple",
    anime: "magenta",
    jkt48: "magenta",
    kpop: "purple",
    hobbies: "purple",
};

interface HeroBannerProps {
    articles: Article[];
}

export default function HeroBanner({ articles }: HeroBannerProps) {
    const featured = articles[0];
    const secondary = articles.slice(1, 4);

    if (!featured) return null;

    return (
        <section className="bg-mamen-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Main Featured Story */}
                    <Link
                        href={getArticleHref(featured)}
                        className="lg:col-span-7 group block"
                    >
                        <div className="relative border-4 border-mamen-white bg-mamen-gray-900 shadow-hard overflow-hidden transition-all duration-150 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[8px_8px_0px_var(--shadow-color)]">
                            <div className="relative aspect-[16/9]">
                                <Image
                                    src={featured.cover_image}
                                    alt={featured.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute top-4 left-4">
                                    <Badge variant={categoryBadgeVariant[featured.category] || "lime"}>
                                        {getArticleSubcategoryLabel(featured)}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                                    <h1 className="font-headline text-xl sm:text-2xl md:text-3xl font-black leading-tight line-clamp-3">
                                        {featured.title}
                                    </h1>
                                    <p className="mt-2 text-sm opacity-90 line-clamp-2 hidden sm:block">
                                        {featured.excerpt}
                                    </p>
                                    <div className="mt-3 flex items-center gap-3 text-xs text-mamen-gray-200">
                                        <span className="font-medium">{featured.author}</span>
                                        <span>•</span>
                                        <time>
                                            {featured.published_at ? formatDate(featured.published_at, {
                                                month: "short",
                                                day: "numeric",
                                            }) : "Draft"}
                                        </time>
                                        <span className="font-headline font-bold tracking-widest text-mamen-lime uppercase ml-auto">
                                            Read →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Secondary Stories Stack */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        {secondary.map((article) => (
                            <Link
                                key={article.id}
                                href={getArticleHref(article)}
                                className="group block flex-1"
                            >
                                <div className="flex gap-3 border-4 border-mamen-white bg-mamen-gray-900 shadow-hard-sm overflow-hidden transition-all duration-150 group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[5px_5px_0px_var(--shadow-color)] h-full">
                                    <div className="relative w-28 sm:w-36 shrink-0">
                                        <Image
                                            src={article.cover_image}
                                            alt={article.title}
                                            fill
                                            className="object-cover"
                                            sizes="150px"
                                        />
                                        <div className="absolute top-2 left-2">
                                            <Badge variant={categoryBadgeVariant[article.category] || "lime"}>
                                                {getArticleSubcategoryLabel(article)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-3 flex flex-col justify-center min-w-0">
                                        <h2 className="font-headline text-sm font-bold leading-tight text-mamen-white line-clamp-2 group-hover:text-mamen-purple transition-colors">
                                            {article.title}
                                        </h2>
                                        <div className="mt-2 flex items-center gap-2 text-[0.65rem] text-mamen-gray-200">
                                            <time>
                                                {article.published_at ? formatDate(article.published_at, {
                                                    month: "short",
                                                    day: "numeric",
                                                }) : "Draft"}
                                            </time>
                                            <span className="font-headline font-bold tracking-wider text-mamen-purple uppercase">
                                                Read →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
