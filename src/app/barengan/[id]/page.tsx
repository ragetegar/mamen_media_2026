import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { BARENGAN_STATUS_OPTIONS } from "@/lib/types";
import { getBarenganPostById } from "@/lib/data";
import { getBarenganCapacity, getBarenganMemberTotal } from "@/lib/barengan";
import { ArrowLeft, Users, Calendar, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import BarenganDetailClient from "./BarenganDetailClient";
import BarenganComments from "./BarenganComments";
import { formatDate } from "@/lib/format";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BarenganDetailPage({ params }: PageProps) {
    const { id } = await params;

    const post = await getBarenganPostById(id);

    if (!post) {
        notFound();
    }

    const statusInfo = BARENGAN_STATUS_OPTIONS.find((s) => s.value === post.status);
    const memberTotal = getBarenganMemberTotal(post);
    const memberCapacity = getBarenganCapacity(post);

    return (
        <>
            <section className="bg-mamen-black py-8 md:py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/barengan"
                        className="inline-flex items-center gap-2 text-sm text-mamen-gray-200 hover:text-mamen-lime transition-colors mb-8"
                    >
                        <ArrowLeft size={16} />
                        Back to Barengan
                    </Link>

                    {/* Post Card */}
                    <div className={`card-frame overflow-hidden mb-8 ${!post.is_active ? "opacity-60" : ""}`}>
                        <div className="p-6">
                            {/* User info */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-mamen-purple bg-mamen-gray-800 shrink-0">
                                    {post.profile?.avatar ? (
                                        <Image
                                            src={post.profile.avatar}
                                            alt={post.profile.name || "User"}
                                            width={48}
                                            height={48}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-mamen-gray-700 font-headline font-bold">
                                            {(post.profile?.name || "?")[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Link
                                        href={`/profile/${post.profile?.handle}`}
                                        className="font-headline text-base font-bold text-mamen-white hover:text-mamen-purple transition-colors"
                                    >
                                        {post.profile?.name || "Anonymous"}
                                    </Link>
                                    <p className="text-xs text-mamen-gray-700">
                                        @{post.profile?.handle || "user"} · {formatDate(post.created_at, {
                                            month: "short", day: "numeric", year: "numeric"
                                        })}
                                    </p>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    {!post.is_active && (
                                        <Badge variant="white" className="opacity-80">
                                            ENDED
                                        </Badge>
                                    )}
                                    <Badge variant={post.status === "ticket_holder" ? "lime" : post.status === "interested_will_come" ? "magenta" : "purple"}>
                                        {statusInfo?.emoji} {statusInfo?.label}
                                    </Badge>
                                </div>
                            </div>

                            {/* Message */}
                            <p className="text-mamen-gray-100 leading-relaxed mb-6">
                                {post.message}
                            </p>

                            {/* Concert info */}
                            {post.concert && (
                                <Link href={`/concerts/${post.concert.slug}`} className="group">
                                    <div className="flex items-center gap-4 p-4 bg-mamen-gray-900 border-2 border-mamen-gray-700 hover:border-mamen-purple transition-colors mb-6">
                                        <div className="w-16 h-20 shrink-0 relative overflow-hidden border border-mamen-gray-700">
                                            <Image
                                                src={post.concert.poster_image}
                                                alt={post.concert.title}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-headline text-sm font-bold text-mamen-white group-hover:text-mamen-purple transition-colors">
                                                {post.concert.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-mamen-gray-700 mt-1">
                                                <Calendar size={12} />
                                                <span>
                                                    {formatDate(post.concert.start_datetime, {
                                                        weekday: "short", month: "short", day: "numeric", year: "numeric"
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-mamen-gray-700 mt-0.5">
                                                <MapPin size={12} />
                                                <span>{post.concert.venue}, {post.concert.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-mamen-gray-700">
                                <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {memberTotal}/{memberCapacity} members
                                </span>
                                <span>Looking for {post.looking_for} people</span>
                            </div>
                        </div>
                    </div>

                    {/* Client-side interactive part */}
                    <BarenganDetailClient post={post} />

                    {/* Comments — auth required for barengan */}
                    <BarenganComments barenganPostId={post.id} />
                </div>
            </section>
        </>
    );
}
