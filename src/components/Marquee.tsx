"use client";

export default function Marquee() {
    const text =
        "GIG ALERTS • NEW DROPS EVERY FRIDAY • JABODETABEK FIRST • JOIN THE CROWD • GIG ALERTS • NEW DROPS EVERY FRIDAY • JABODETABEK FIRST • JOIN THE CROWD • ";

    return (
        <div className="bg-mamen-lime overflow-hidden whitespace-nowrap border-b-[3px] border-mamen-black">
            <div className="animate-marquee inline-flex">
                <span className="font-headline text-sm font-bold tracking-wider text-mamen-black px-4 py-1.5">
                    {text}
                </span>
                <span className="font-headline text-sm font-bold tracking-wider text-mamen-black px-4 py-1.5">
                    {text}
                </span>
            </div>
        </div>
    );
}
