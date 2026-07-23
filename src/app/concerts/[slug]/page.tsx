import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import ArticleTile from "@/components/ArticleTile";
import ConcertInterestButton from "./ConcertInterestButton";
import ConcertAttendanceButton from "./ConcertAttendanceButton";
import ConcertAttendees from "@/components/ConcertAttendees";
import { getConcertBySlug, getRelatedArticles, getBarenganCountForConcert } from "@/lib/data";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import { formatDate, formatTime } from "@/lib/format";
import ShareButtons from "@/components/ShareButtons";
import StructuredData from "@/components/StructuredData";
import TicketLinkButton from "@/components/TicketLinkButton";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const concert = await getConcertBySlug(slug);
    if (!concert) return { title: "Concert Not Found" };

    return {
        title: concert.title,
        description: concert.description || `${concert.title} at ${concert.venue}, ${concert.city}`,
        alternates: {
            canonical: absoluteUrl(`/concerts/${concert.slug}`),
        },
        openGraph: {
            title: concert.title,
            description: concert.description || `${concert.title} at ${concert.venue}, ${concert.city}`,
            url: absoluteUrl(`/concerts/${concert.slug}`),
            images: [absoluteUrl(concert.poster_image)],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: concert.title,
            description: concert.description || `${concert.title} at ${concert.venue}, ${concert.city}`,
            images: [absoluteUrl(concert.poster_image)],
        },
    };
}

export default async function ConcertDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const concert = await getConcertBySlug(slug);
    if (!concert) redirect("/");

    const eventDate = new Date(concert.start_datetime);
    const eventEndDate = new Date(concert.end_datetime || concert.start_datetime);
    const isPast = eventEndDate < new Date();
    const relatedArticles = await getRelatedArticles("", 3, concert.id);
    const barenganCount = await getBarenganCountForConcert(concert.id);
    const concertUrl = absoluteUrl(`/concerts/${concert.slug}`);
    const concertJsonLd = {
        "@context": "https://schema.org",
        "@type": "MusicEvent",
        name: concert.title,
        description: concert.description || `${concert.title} at ${concert.venue}, ${concert.city}`,
        image: [absoluteUrl(concert.poster_image)],
        startDate: concert.start_datetime,
        endDate: concert.end_datetime || concert.start_datetime,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
            "@type": "Place",
            name: concert.venue,
            address: {
                "@type": "PostalAddress",
                addressLocality: concert.city,
                addressCountry: "ID",
            },
        },
        url: concertUrl,
        offers: concert.ticket_url
            ? {
                "@type": "Offer",
                url: concert.ticket_url,
                availability: isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            }
            : undefined,
    };

    return (
        <>
            <StructuredData data={concertJsonLd} />
            {/* Concert Hero */}
            <section className="bg-mamen-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Poster */}
                        <div className="border-4 border-mamen-purple shadow-hard-purple overflow-hidden">
                            <div className="relative aspect-[3/4]">
                                <Image
                                    src={concert.poster_image}
                                    alt={concert.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {isPast ? (
                                        <Badge variant="white">Past Event</Badge>
                                    ) : (
                                        <Badge variant="lime">Upcoming</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col justify-center">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {concert.genre_tags.map((tag) => (
                                    <Badge key={tag} variant="purple">
                                        {tag}
                                    </Badge>
                                ))}
                                <Badge variant="magenta">{concert.city}</Badge>
                            </div>

                            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] text-mamen-white">
                                {concert.title}
                            </h1>

                            {concert.description && (
                                <p className="mt-4 text-mamen-gray-200 leading-relaxed">
                                    {concert.description}
                                </p>
                            )}

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 text-mamen-gray-100">
                                    <div className="w-10 h-10 bg-mamen-purple/20 flex items-center justify-center border-2 border-mamen-purple">
                                        <Calendar size={18} className="text-mamen-purple" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">
                                            {formatDate(eventDate, {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                        {concert.end_datetime && (
                                            <p className="text-xs text-mamen-gray-200">
                                                {formatDate(concert.end_datetime, {
                                                    month: "long",
                                                    day: "numeric",
                                                })}{" "}
                                                (multi-day)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-mamen-gray-100">
                                    <div className="w-10 h-10 bg-mamen-magenta/20 flex items-center justify-center border-2 border-mamen-magenta">
                                        <Clock size={18} className="text-mamen-magenta" />
                                    </div>
                                    <p className="font-bold text-sm">
                                        {formatTime(eventDate)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 text-mamen-gray-100">
                                    <div className="w-10 h-10 bg-mamen-lime/20 flex items-center justify-center border-2 border-mamen-lime">
                                        <MapPin size={18} className="text-mamen-lime" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{concert.venue}</p>
                                        <p className="text-xs text-mamen-gray-200">{concert.city}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-mamen-gray-100">
                                    <div className="w-10 h-10 bg-mamen-purple/20 flex items-center justify-center border-2 border-mamen-purple">
                                        <Users size={18} className="text-mamen-purple" />
                                    </div>
                                    <p className="font-bold text-sm text-mamen-magenta">
                                        {concert.interested_count.toLocaleString()} people interested
                                    </p>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="mt-8 flex flex-wrap gap-4">
                                {concert.ticket_url && !isPast && (
                                    <TicketLinkButton
                                        href={concert.ticket_url}
                                        concertId={concert.id}
                                        concertTitle={concert.title}
                                    />
                                )}
                                {!isPast ? (
                                    <ConcertInterestButton concertId={concert.id} />
                                ) : (
                                    <ConcertAttendanceButton concertId={concert.id} />
                                )}
                            </div>

                            {/* Find Barengan */}
                            <div className="mt-6 p-4 bg-mamen-gray-900 border-2 border-mamen-purple">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-headline text-sm font-bold text-mamen-white">
                                            🤝 Find Concert Buddy
                                        </p>
                                        <p className="text-xs text-mamen-gray-200 mt-1">
                                            {barenganCount > 0
                                                ? `${barenganCount} people looking for a buddy`
                                                : "Be the first to find a buddy!"}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/barengan?concert=${concert.slug}`}
                                        className="px-4 py-2 bg-mamen-purple text-mamen-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                                    >
                                        Barengan →
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-6">
                                <ShareButtons title={concert.title} url={concertUrl} itemType="concert" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {isPast && (
                <section className="bg-mamen-black border-t-2 border-mamen-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <ConcertAttendees concertId={concert.id} isPast={isPast} />
                    </div>
                </section>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="bg-mamen-gray-900 py-12 md:py-16 border-t-4 border-mamen-purple">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-headline text-3xl font-black text-mamen-white mb-8">
                            RELATED <span className="text-mamen-lime">READS</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedArticles.map((article) => (
                                <ArticleTile key={article.id} article={article} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
