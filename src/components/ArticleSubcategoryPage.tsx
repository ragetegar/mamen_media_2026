import CategoryListingPage from "@/components/CategoryListingPage";
import { ARTICLE_TAXONOMY, getArticleCategoryLabel, isValidArticleTaxonomy } from "@/lib/article-taxonomy";
import { ArticleCategory, ArticleSubcategory } from "@/lib/types";
import { notFound } from "next/navigation";

interface ArticleSubcategoryPageProps {
    category: ArticleCategory;
    subcategory: string;
}

export default function ArticleSubcategoryPage({ category, subcategory }: ArticleSubcategoryPageProps) {
    if (!isValidArticleTaxonomy(category, subcategory)) notFound();

    const categoryLabel = getArticleCategoryLabel(category);
    const subcategoryLabel = ARTICLE_TAXONOMY[category].find((item) => item.value === subcategory)?.label;

    return (
        <CategoryListingPage
            category={category}
            title={categoryLabel.toUpperCase()}
            highlight={subcategoryLabel?.toUpperCase() || subcategory.toUpperCase()}
            description={`Latest ${subcategoryLabel || subcategory} articles from MAMEN.`}
            subcategories={ARTICLE_TAXONOMY[category]}
            activeSub={subcategory as ArticleSubcategory}
        />
    );
}
