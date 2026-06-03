import { ReactNode } from "react";

interface CardFrameProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export default function CardFrame({
    children,
    className = "",
    hover = true,
}: CardFrameProps) {
    return (
        <div
            className={`card-frame ${hover ? "transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_var(--shadow-color)]" : ""} ${className}`}
        >
            {children}
        </div>
    );
}
