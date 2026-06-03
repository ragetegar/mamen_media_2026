import Link from "next/link";
import Image from "next/image";
import { Concert, ConcertType } from "@/lib/types";
import { Calendar, MapPin } from "lucide-react";

interface ConcertCardMiniProps {
    concert: Concert;
}

const typeColor: Record<ConcertType, string> = {
    festival: "bg-mamen-magenta",
    local: "bg-mamen-lime text-mamen-black",
    international: "bg-mamen-purple",
    kpop: "bg-mamen-magenta",
};

const typeLabel: Record<ConcertType, string> = {
    festival: "Festival",
    local: "Local",
    international: "Intl",
    kpop: "K-Pop",
};

export default function ConcertCardMini({ concert }: ConcertCardMiniProps) {
    const eventDate = new Date(concert.start_datetime);
    const isPast = eventDate < new Date();

    return (
        <Link href={`/concerts/${concert.slug}`} className="group block">
            <div className="card-frame overflow-hidden h-full">
                {/* Compact poster */}
                <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                        src={concert.poster_image}
                        alt={concert.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute top-2 left-2">
                        <span className={`text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider text-white ${typeColor[concert.concert_type]} ${isPast ? "opacity-60" : ""}`}>
                            {typeLabel[concert.concert_type]}
                        </span>
                    </div>
                    {isPast && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-xs font-headline font-bold text-white uppercase tracking-wider opacity-80">Past</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-2.5">
                    <h3 className="font-headline text-xs font-bold leading-tight text-mamen-white group-hover:text-mamen-purple transition-colors line-clamp-2">
                        {concert.title}
                    </h3>
                    <div className="mt-1.5 space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-mamen-gray-700">
                            <Calendar size={10} className="shrink-0" />
                            <span>
                                {eventDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-mamen-gray-700">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{concert.city}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
