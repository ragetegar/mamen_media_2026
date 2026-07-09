import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { Concert, ConcertType } from "@/lib/types";
import { Calendar, MapPin, Users } from "lucide-react";

interface ConcertTileProps {
    concert: Concert;
}

const concertTypeLabel: Record<ConcertType, string> = {
    festival: "Festival",
    local: "Local Artist",
    international: "International",
    kpop: "K-Pop",
};

const concertTypeVariant: Record<ConcertType, "lime" | "magenta" | "purple" | "white"> = {
    festival: "magenta",
    local: "lime",
    international: "purple",
    kpop: "magenta",
};

export default function ConcertTile({ concert }: ConcertTileProps) {
    const eventDate = new Date(concert.start_datetime);
    const endDate = concert.end_datetime ? new Date(concert.end_datetime) : eventDate;
    const isPast = endDate < new Date();

    return (
        <Link href={`/concerts/${concert.slug}`} className={`group block ${isPast ? "opacity-60" : ""}`}>
            <div className="card-frame overflow-hidden">
                {/* Poster */}
                <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                        src={concert.poster_image}
                        alt={concert.title}
                        fill
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isPast ? "grayscale-[30%]" : ""}`}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {isPast ? (
                            <Badge variant="white">ENDED</Badge>
                        ) : (
                            <Badge variant="lime">Upcoming</Badge>
                        )}
                        <Badge variant={concertTypeVariant[concert.concert_type]}>
                            {concertTypeLabel[concert.concert_type]}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-headline text-base font-bold leading-tight text-mamen-white group-hover:text-mamen-purple transition-colors line-clamp-2">
                        {concert.title}
                    </h3>

                    <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-mamen-gray-700">
                            <Calendar size={13} className="shrink-0" />
                            <span>
                                {eventDate.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-mamen-gray-700">
                            <MapPin size={13} className="shrink-0" />
                            <div className="flex items-center gap-1 min-w-0">
                                <span className="truncate font-medium">{concert.venue}</span>
                                <span className="shrink-0 text-mamen-purple px-1 bg-mamen-purple/10 rounded-sm">
                                    {concert.city}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-mamen-magenta font-medium">
                            <Users size={12} />
                            <span>{concert.interested_count.toLocaleString()} interested</span>
                        </div>
                        <span className="font-headline text-xs font-bold tracking-widest text-mamen-purple uppercase">
                            View →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
