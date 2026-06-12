import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { Article } from "@/lib/types";
import { getArticleHref, getArticleSubcategoryLabel } from "@/lib/article-taxonomy";

const categoryBadgeVariant: Record<string, "lime" | "magenta" | "purple" | "white"> = {
    "public-voice": "white",
    music: "purple",
    lifestyle: "lime",
    sports: "magenta",
    hobbies: "lime",
};

interface ArticleTileProps {
    article: Article;
}

export default function ArticleTile({ article }: ArticleTileProps) {
    return (
        <Link href={getArticleHref(article)} className="group block">
            <div className="card-frame overflow-hidden">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                        src={article.cover_image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 left-3">
                        <Badge variant={categoryBadgeVariant[article.category] || "lime"}>
                            {getArticleSubcategoryLabel(article)}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-headline text-lg font-bold leading-tight text-mamen-white group-hover:text-mamen-purple transition-colors line-clamp-2">
                        {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-mamen-gray-700 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-mamen-gray-700 font-medium">
                            {article.published_at ? new Date(article.published_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }) : "Draft"}
                        </span>
                        <span className="font-headline text-xs font-bold tracking-widest text-mamen-purple uppercase">
                            Read →
                        </span>
                    </div>
                    {article.tags && article.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {article.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 bg-mamen-gray-800 text-mamen-gray-200 font-headline tracking-wide uppercase border border-mamen-gray-700"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
