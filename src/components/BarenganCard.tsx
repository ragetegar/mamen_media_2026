import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { BarenganPost, BARENGAN_STATUS_OPTIONS } from "@/lib/types";
import { Users, MessageCircle } from "lucide-react";

interface BarenganCardProps {
    post: BarenganPost;
}

export default function BarenganCard({ post }: BarenganCardProps) {
    const statusInfo = BARENGAN_STATUS_OPTIONS.find((s) => s.value === post.status);
    const timeAgo = getTimeAgo(new Date(post.created_at));

    const isEnded = !post.is_active;

    return (
        <Link href={`/barengan/${post.id}`} className="group block">
            <div className={`card-frame overflow-hidden hover:border-mamen-purple transition-colors ${isEnded ? "opacity-60" : ""}`}>
                <div className="p-5">
                    {/* User info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-mamen-purple bg-mamen-gray-800 shrink-0">
                            {post.profile?.avatar ? (
                                <Image
                                    src={post.profile.avatar}
                                    alt={post.profile.name || "User"}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-mamen-gray-700 font-headline font-bold text-sm">
                                    {(post.profile?.name || "?")[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-headline text-sm font-bold text-mamen-white truncate">
                                {post.profile?.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-mamen-gray-700">
                                @{post.profile?.handle || "user"} · {timeAgo}
                            </p>
                        </div>
                        <div className="ml-auto shrink-0 flex items-center gap-2">
                            {isEnded && (
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
                    <p className="text-sm text-mamen-gray-100 leading-relaxed line-clamp-3 mb-4">
                        {post.message || "No message yet..."}
                    </p>

                    {/* Concert info */}
                    {post.concert && (
                        <div className="flex items-center gap-3 p-3 bg-mamen-gray-900 border-2 border-mamen-gray-800 mb-4">
                            <div className="w-12 h-16 shrink-0 relative overflow-hidden border border-mamen-gray-700">
                                <Image
                                    src={post.concert.poster_image}
                                    alt={post.concert.title}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="font-headline text-xs font-bold text-mamen-white truncate">
                                    {post.concert.title}
                                </p>
                                <p className="text-xs text-mamen-gray-700 mt-0.5">
                                    {new Date(post.concert.start_datetime).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })} · {post.concert.venue}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-mamen-gray-700">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Users size={13} />
                                {post.approved_count || 0}/{post.max_members || post.looking_for} members
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle size={13} />
                                Looking for {post.looking_for}
                            </span>
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

function getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
