import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
    return (
        <section className="min-h-[70vh] bg-mamen-black flex items-center justify-center px-4 py-16">
            <div className="max-w-xl border-4 border-mamen-purple bg-mamen-gray-900 p-8 text-center shadow-hard-purple">
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-mamen-purple">
                    404
                </p>
                <h1 className="mt-3 font-headline text-4xl font-black uppercase text-mamen-white">
                    Page Not Found
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-mamen-gray-200">
                    The page you opened does not exist or has moved.
                </p>
                <div className="mt-6">
                    <Link href="/">
                        <Button variant="lime">
                            Back Home
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
