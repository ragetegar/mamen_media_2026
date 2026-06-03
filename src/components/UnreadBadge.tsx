"use client";

interface UnreadBadgeProps {
    count: number;
}

export default function UnreadBadge({ count }: UnreadBadgeProps) {
    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center bg-red-500 text-white px-1">
            {count <= 99 ? count : "99+"}
        </span>
    );
}
