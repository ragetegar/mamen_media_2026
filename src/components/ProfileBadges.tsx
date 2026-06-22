import { BadgeCheck } from "lucide-react";

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

