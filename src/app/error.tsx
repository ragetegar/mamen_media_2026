"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <section className="min-h-[70vh] bg-mamen-black flex items-center justify-center px-4 py-16">
            <div className="max-w-xl border-4 border-mamen-magenta bg-mamen-gray-900 p-8 text-center shadow-hard">
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-mamen-magenta">
                    Something broke
                </p>
                <h1 className="mt-3 font-headline text-4xl font-black uppercase text-mamen-white">
                    Page Error
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-mamen-gray-200">
                    The page could not load properly. Try again, or go back to the homepage.
                </p>
                {error.digest && (
                    <p className="mt-3 text-xs text-mamen-gray-700">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button variant="magenta" onClick={reset}>
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="secondary">
                            Home
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
