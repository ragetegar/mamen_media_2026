"use server";

import { createServerSupabase, createServiceRoleClient } from "@/lib/supabase";

type InterestWithConcert = {
    concert_id: string;
    concerts:
    | {
        slug: string;
        title: string;
        start_datetime: string;
        end_datetime?: string | null;
    }
    | {
        slug: string;
        title: string;
        start_datetime: string;
        end_datetime?: string | null;
    }[]
    | null;
};

type EndedInterest = {
    concert_id: string;
    concert: {
        slug: string;
        title: string;
        start_datetime: string;
        end_datetime?: string | null;
    };
};

export async function ensureConcertProofNotifications() {
    const userSupabase = await createServerSupabase();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) return { created: 0 };

    const supabase = createServiceRoleClient();
    const { data: interests, error: interestError } = await supabase
        .from("concert_interests")
        .select("concert_id, concerts!inner(slug, title, start_datetime, end_datetime)")
        .eq("user_id", user.id);

    if (interestError || !interests) return { created: 0 };

    const now = Date.now();
    const endedInterests: EndedInterest[] = [];
    for (const interest of interests as unknown as InterestWithConcert[]) {
        const concert = Array.isArray(interest.concerts)
            ? interest.concerts[0]
            : interest.concerts;
        if (!concert) continue;

        const endDate = new Date(concert.end_datetime || concert.start_datetime).getTime();
        if (Number.isFinite(endDate) && endDate < now) {
            endedInterests.push({ concert_id: interest.concert_id, concert });
        }
    }

    if (endedInterests.length === 0) return { created: 0 };

    const concertIds = endedInterests.map((interest) => interest.concert_id);
    const [{ data: attendances }, { data: existingNotifications }] = await Promise.all([
        supabase
            .from("concert_attendees")
            .select("concert_id")
            .eq("user_id", user.id)
            .in("concert_id", concertIds),
        supabase
            .from("notifications")
            .select("metadata")
            .eq("user_id", user.id)
            .eq("type", "concert_proof_reminder"),
    ]);

    const attendedConcertIds = new Set((attendances || []).map((row) => row.concert_id as string));
    const notifiedConcertIds = new Set(
        (existingNotifications || [])
            .map((row) => {
                const metadata = row.metadata as { concert_id?: string } | null;
                return metadata?.concert_id;
            })
            .filter(Boolean) as string[],
    );

    const rows = endedInterests
        .filter((interest) => !attendedConcertIds.has(interest.concert_id))
        .filter((interest) => !notifiedConcertIds.has(interest.concert_id))
        .map((interest) => {
            return {
                user_id: user.id,
                type: "concert_proof_reminder",
                title: "MAMEN",
                body: "Concert you are coming to has ended. Prove that you came.",
                href: `/concerts/${interest.concert.slug}`,
                metadata: {
                    concert_id: interest.concert_id,
                    concert_title: interest.concert.title,
                },
            };
        });

    if (rows.length === 0) return { created: 0 };

    const { error: insertError } = await supabase
        .from("notifications")
        .insert(rows);

    if (insertError) return { created: 0 };
    return { created: rows.length };
}
