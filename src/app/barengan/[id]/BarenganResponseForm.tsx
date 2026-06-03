"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { BarenganResponse } from "@/lib/types";
import { createBarenganResponse, getBarenganResponses } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { Send } from "lucide-react";
import LoginModal from "@/components/LoginModal";

interface BarenganResponseFormProps {
    postId: string;
    initialResponses: BarenganResponse[];
}

export default function BarenganResponseForm({ postId, initialResponses }: BarenganResponseFormProps) {
    const { user } = useAuth();
    const [responses, setResponses] = useState<BarenganResponse[]>(initialResponses);
    const [responseText, setResponseText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);

    const handleRespond = async () => {
        if (!user) {
            setLoginOpen(true);
            return;
        }
        if (!responseText.trim()) return;

        setSubmitting(true);
        const result = await createBarenganResponse({
            barengan_post_id: postId,
            user_id: user.id,
            message: responseText.trim(),
        });

        if (result.success) {
            const newResponses = await getBarenganResponses(postId);
            setResponses(newResponses);
            setResponseText("");
        }
        setSubmitting(false);
    };

    return (
        <>
            {/* Response input */}
            <div className="card-frame overflow-hidden mb-8">
                <div className="p-4 flex gap-3">
                    <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder={user ? "I'm interested! Let me join..." : "Log in to respond..."}
                        rows={2}
                        maxLength={300}
                        disabled={!user}
                        className="flex-1 bg-mamen-gray-900 border-2 border-mamen-gray-700 p-3 text-mamen-white text-sm outline-none focus:border-mamen-purple transition-colors resize-none placeholder:text-mamen-gray-700 disabled:opacity-50"
                    />
                    <Button
                        variant="lime"
                        onClick={handleRespond}
                        disabled={submitting || !responseText.trim()}
                    >
                        <Send size={16} />
                    </Button>
                </div>
            </div>

            {/* Responses */}
            <div className="space-y-4">
                <h2 className="font-headline text-lg font-bold text-mamen-white">
                    Responses ({responses.length})
                </h2>

                {responses.length === 0 ? (
                    <div className="text-center py-12 border-4 border-dashed border-mamen-gray-800">
                        <p className="text-mamen-gray-700 text-sm">
                            No responses yet. Be the first to respond!
                        </p>
                    </div>
                ) : (
                    responses.map((response) => (
                        <div key={response.id} className="card-frame overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-mamen-gray-700 bg-mamen-gray-800 shrink-0">
                                        {response.profile?.avatar ? (
                                            <Image
                                                src={response.profile.avatar}
                                                alt={response.profile.name || "User"}
                                                width={32}
                                                height={32}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-mamen-gray-700 font-headline font-bold text-xs">
                                                {(response.profile?.name || "?")[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Link
                                            href={`/profile/${response.profile?.handle}`}
                                            className="font-headline text-sm font-bold text-mamen-white hover:text-mamen-purple transition-colors"
                                        >
                                            {response.profile?.name || "Anonymous"}
                                        </Link>
                                        <p className="text-xs text-mamen-gray-700">
                                            {new Date(response.created_at).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-mamen-gray-100 leading-relaxed">
                                    {response.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
