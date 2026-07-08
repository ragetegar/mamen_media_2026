import { BadgeCheck } from "lucide-react";
import type { ProfileSnippet } from "@/lib/types";

export type ProfileRole = "admin" | "contributor" | "user";

interface RoleBadgeProps {
    role?: ProfileRole | null;
    compact?: boolean;
}

export function RoleBadge({ role, compact = false }: RoleBadgeProps) {
    if (role === "admin") {
        return (
            <span className={`${compact ? "text-[10px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"} bg-mamen-purple text-white font-bold uppercase tracking-wider rounded-full`}>
                Admin
            </span>
        );
    }

    if (role === "contributor") {
        return (
            <span className={`${compact ? "text-[10px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"} bg-mamen-magenta text-white font-bold uppercase tracking-wider rounded-full`}>
                Contributor
            </span>
        );
    }

    return null;
}

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
    return (
        <span
            className={`inline-flex items-center justify-center rounded-full bg-[#1D9BF0] text-white ${compact ? "h-4 w-4" : "h-5 w-5"}`}
            title="Verified"
            aria-label="Verified"
        >
            <BadgeCheck size={compact ? 14 : 16} fill="currentColor" strokeWidth={2.5} />
        </span>
    );
}

interface TrustStatusBadgeProps {
    profile?: Pick<ProfileSnippet, "role" | "is_verified" | "barengan_trust_score" | "barengan_custom_tag"> | null;
    compact?: boolean;
}

export function TrustStatusBadge({ profile, compact = false }: TrustStatusBadgeProps) {
    if (!profile) return null;

    const baseClass = compact
        ? "text-[9px] px-1.5 py-0.5"
        : "text-[10px] px-2 py-0.5";

    if (profile.role === "admin") {
        return <RoleBadge role="admin" compact={compact} />;
    }

    if (profile.is_verified) {
        return (
            <span className={`${baseClass} inline-flex items-center gap-1 rounded-full bg-[#1D9BF0] text-white font-bold uppercase tracking-wider`}>
                <BadgeCheck size={compact ? 11 : 12} fill="currentColor" strokeWidth={2.5} />
                Verified
            </span>
        );
    }

    const score = profile.barengan_trust_score || 0;
    if (score > 0) {
        return (
            <span className={`${baseClass} rounded-full bg-mamen-lime text-mamen-black font-bold uppercase tracking-wider`}>
                Trusted
            </span>
        );
    }

    if (score < 0) {
        return (
            <span className={`${baseClass} rounded-full bg-red-600 text-white font-bold uppercase tracking-wider`}>
                Untrust
            </span>
        );
    }

    return (
        <span className={`${baseClass} rounded-full bg-mamen-gray-800 text-mamen-gray-200 border border-mamen-gray-700 font-bold uppercase tracking-wider`}>
            New User
        </span>
    );
}

export function CustomProfileTagBadge({ tag, compact = false }: { tag?: string | null; compact?: boolean }) {
    const cleanTag = tag?.trim();
    if (!cleanTag) return null;

    return (
        <span className={`${compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"} rounded-full bg-mamen-magenta/15 text-mamen-magenta border border-mamen-magenta/40 font-bold uppercase tracking-wider`}>
            {cleanTag}
        </span>
    );
}

export function ProfileTrustBadges({ profile, compact = false }: TrustStatusBadgeProps) {
    if (!profile) return null;

    return (
        <span className="inline-flex items-center gap-1.5 flex-wrap">
            <TrustStatusBadge profile={profile} compact={compact} />
            <CustomProfileTagBadge tag={profile.barengan_custom_tag} compact={compact} />
        </span>
    );
}

interface OfficialPartnerBadgeProps {
    name?: string | null;
    logo?: string | null;
    url?: string | null;
}

export function OfficialPartnerBadge({ name, logo, url }: OfficialPartnerBadgeProps) {
    if (!name && !logo) return null;

    const content = (
        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-mamen-lime/60 bg-mamen-lime/10 text-mamen-lime font-headline text-[10px] font-bold uppercase tracking-wider">
            {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={logo}
                    alt={name ? `${name} logo` : "Official partner logo"}
                    className="h-4 w-4 rounded-full object-cover bg-mamen-black"
                />
            )}
            <span>{name || "Official Partner"}</span>
        </span>
    );

    if (!url) return content;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex hover:opacity-80 transition-opacity">
            {content}
        </a>
    );
}
