import ArticleTile from "@/components/ArticleTile";
import SectionHeader from "@/components/SectionHeader";
import { getArticles } from "@/lib/data";
import { getArticleSubcategoryHref } from "@/lib/article-taxonomy";
import { ArticleCategory, ArticleSubcategory } from "@/lib/types";
import { GoogleAdUnit } from "@/components/GoogleAds";
import Link from "next/link";

interface CategoryListingPageProps {
    category: ArticleCategory;
    title: string;
    highlight: string;
    description: string;
    subcategories: readonly { value: ArticleSubcategory; label: string }[];
    activeSub?: ArticleSubcategory | null;
}

export default async function CategoryListingPage({
    category,
    title,
    highlight,
    description,
    subcategories,
    activeSub,
}: CategoryListingPageProps) {
    const articles = await getArticles(category, activeSub || undefined);
    const activeSubLabel = subcategories.find((sub) => sub.value === activeSub)?.label;

    return (
        <>
            {/* Header */}
            <section className="bg-mamen-black py-12 md:py-16 border-b-4 border-mamen-purple">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader title={title} highlight={highlight} />
                    <p className="text-mamen-gray-200 text-base max-w-lg -mt-4">
                        {description}
                    </p>
                </div>
            </section>

            {/* Subcategory Tabs */}
            {subcategories.length > 0 && (
                <section className="bg-mamen-gray-900 border-b-4 border-mamen-black sticky top-16 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
                            <Link
                                href={`/${category}`}
                                className={`font-headline text-xs font-bold tracking-widest uppercase px-4 py-2 shrink-0 border-2 transition-all ${!activeSub
                                    ? "bg-mamen-lime text-mamen-black border-mamen-black shadow-hard-sm"
                                    : "bg-transparent text-mamen-gray-200 border-transparent hover:text-mamen-lime"
                                    }`}
                            >
                                All
                            </Link>
                            {subcategories.map((sub) => (
                                <Link
                                    key={sub.value}
                                    href={getArticleSubcategoryHref(category, sub.value)}
                                    className={`font-headline text-xs font-bold tracking-widest uppercase px-4 py-2 shrink-0 border-2 transition-all ${activeSub === sub.value
                                        ? "bg-mamen-lime text-mamen-black border-mamen-black shadow-hard-sm"
                                        : "bg-transparent text-mamen-gray-200 border-transparent hover:text-mamen-lime"
                                        }`}
                                >
                                    {sub.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Articles Grid */}
            <section className="bg-mamen-black py-12 md:py-16 min-h-[50vh]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article, index) => (
                                <div key={article.id} className="contents">
                                    {index === 3 && (
                                        <GoogleAdUnit
                                            placement="feed"
                                            className="min-h-[120px] md:col-span-2 lg:col-span-3"
                                            format="horizontal"
                                        />
                                    )}
                                    <ArticleTile article={article} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-4 border-dashed border-mamen-gray-800">
                            <p className="font-headline text-2xl font-bold text-mamen-gray-700">
                                No published {activeSubLabel ? `${highlight} ${activeSubLabel}` : highlight} articles yet.
                            </p>
                            <p className="mt-3 text-sm text-mamen-gray-200">
                                New articles will appear here after they are published from the admin page.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
