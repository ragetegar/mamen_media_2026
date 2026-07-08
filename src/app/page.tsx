import HeroBanner from "@/components/HeroFeature"; // Let's rename HeroFeature to HeroBanner usage
import TopBrands from "@/components/VibeCheck"; // TopBrands component overriding VibeCheck file
import SectionHeader from "@/components/SectionHeader";
import ConcertTile from "@/components/ConcertTile";
import ArticleTile from "@/components/ArticleTile";
import NewsletterBlock from "@/components/NewsletterBlock";
import SpotifyPodcast from "@/components/SpotifyPodcast";
import PublicVoiceSection from "@/components/PublicVoiceSection";
import { GoogleAdUnit } from "@/components/GoogleAds";
import { getArticles, getConcerts, getFeaturedBrands } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, publicVoiceArticles] = await Promise.all([
    getArticles(),
    getArticles("public-voice"),
  ]);
  const editorialArticles = articles.filter((article) => article.category !== "public-voice");
  const topArticles = editorialArticles.slice(0, 4); // For the HeroBanner
  const latestArticles = editorialArticles.slice(4, 10); // For Latest Drops
  const allConcerts = await getConcerts();
  const concerts = allConcerts.slice(0, 4);
  const brands = await getFeaturedBrands();

  return (
    <>
      {/* 1. Editorial Hero Banner */}
      <HeroBanner articles={topArticles} />

      {/* 2. Top Brands (replaces Vibe Check) */}
      <TopBrands brands={brands} />

      {/* 3. Public Voice — intentionally separate from the headline */}
      <PublicVoiceSection articles={publicVoiceArticles} />

      <section className="bg-mamen-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <GoogleAdUnit placement="feed" className="min-h-[120px]" format="horizontal" />
        </div>
      </section>

      {/* 4. Latest Drops — Pop Culture Articles Grid */}
      <section className="bg-mamen-black py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="LATEST"
            highlight="DROPS"
            seeAllHref="/music/news"
            seeAllLabel="See All News →"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <ArticleTile key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Fresh Heat — Upcoming Concerts */}
      <section className="bg-mamen-gray-900 py-16 md:py-20 border-t-4 border-mamen-magenta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="FRESH"
            highlight="HEAT"
            seeAllHref="/concerts"
            seeAllLabel="See All Concerts →"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {concerts.map((concert) => (
              <ConcertTile key={concert.id} concert={concert} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Podcast — Spotify Embed */}
      <SpotifyPodcast showId="3mZaixB9zIUiQwbe2Msqit" />

      {/* 7. Newsletter — JOIN THE CROWD */}
      <NewsletterBlock />
    </>
  );
}
