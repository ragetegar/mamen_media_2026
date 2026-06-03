import { redirect } from "next/navigation";
import { getArticleBySlug } from "@/lib/data";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Redirect old /media/[slug] to /{category}/[slug] for backward compatibility
export default async function MediaArticleRedirect({ params }: PageProps) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        redirect("/music");
    }

    redirect(`/${article.category}/${article.slug}`);
}
