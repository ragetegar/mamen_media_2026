import { ReactNode } from "react";

interface BadgeProps {
    variant?: "lime" | "magenta" | "purple" | "white";
    children: ReactNode;
    className?: string;
}

export default function Badge({
    variant = "lime",
    children,
    className = "",
}: BadgeProps) {
    const variants = {
        lime: "bg-mamen-lime text-mamen-black",
        magenta: "bg-mamen-magenta text-mamen-white",
        purple: "bg-mamen-purple text-mamen-white",
        white: "bg-mamen-white text-mamen-black border border-mamen-black",
    };

    return (
        <span
            className={`inline-block font-headline font-bold text-[0.65rem] tracking-widest uppercase px-3 py-1 ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
