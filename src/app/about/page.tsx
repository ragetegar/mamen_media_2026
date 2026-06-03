import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About MAMEN",
    description: "About Mamen.id — Indonesian music and concert culture platform.",
};

export default function AboutPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-mamen-black py-16 md:py-24 border-b-4 border-mamen-purple">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] text-mamen-white">
                        ABOUT
                        <br />
                        <span className="text-mamen-purple">MAMEN</span>
                        <span className="text-mamen-magenta">.</span>
                    </h1>

                    <div className="mt-8 space-y-6 text-mamen-gray-100 leading-relaxed text-lg">
                        <p>
                            <strong className="text-mamen-white">MAMEN</strong> is Indonesia&apos;s home for
                            music culture, concert discovery, and the community that lives for the scene. We
                            cover everything from indie gems to stadium-filling headliners — if it moves the
                            crowd, we&apos;re on it.
                        </p>
                        <p>
                            Born in Jakarta, built for the Jabodetabek scene and beyond. We believe Indonesian
                            music deserves world-class coverage, and our fans deserve a platform that matches
                            their energy.
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Do */}
            <section className="bg-mamen-gray-900 py-16 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-headline text-3xl font-black text-mamen-lime uppercase mb-8">
                        What We Do
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Music Reviews",
                                desc: "In-depth reviews of the latest albums, singles, and EPs from Indonesian and international artists.",
                                icon: "🎵",
                            },
                            {
                                title: "Concert Coverage",
                                desc: "Recaps, previews, and listings for the hottest concerts and festivals across Indonesia.",
                                icon: "🎤",
                            },
                            {
                                title: "Culture & News",
                                desc: "Deep dives into the scenes, subcultures, and stories that shape Indonesian music and pop culture.",
                                icon: "🔥",
                            },
                            {
                                title: "Curated Gear",
                                desc: "Hand-picked products for music lovers — from concert earplugs to vinyl players and merch.",
                                icon: "🎧",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="border-4 border-mamen-black bg-mamen-black p-6 shadow-hard transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000000]"
                            >
                                <span className="text-3xl mb-3 block">{item.icon}</span>
                                <h3 className="font-headline text-lg font-bold text-mamen-white">{item.title}</h3>
                                <p className="mt-2 text-sm text-mamen-gray-200 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Affiliate Disclosure */}
            <section className="bg-mamen-black py-16 md:py-20 border-t-4 border-mamen-magenta">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-headline text-3xl font-black text-mamen-magenta uppercase mb-6">
                        Affiliate Disclosure
                    </h2>
                    <div className="border-4 border-mamen-magenta bg-mamen-gray-900 p-8 shadow-hard-magenta">
                        <p className="text-mamen-gray-100 leading-relaxed">
                            Some articles on MAMEN contain affiliate links to products on Shopee, Tokopedia,
                            and TikTok Shop. When you click these links and make a purchase, we may earn a small
                            commission at no extra cost to you.
                        </p>
                        <p className="mt-4 text-mamen-gray-100 leading-relaxed">
                            This revenue helps us keep MAMEN running and continue delivering quality content
                            about Indonesian music and culture. Our editorial decisions are never influenced by
                            affiliate partnerships — we only feature products we genuinely believe in.
                        </p>
                        <p className="mt-4 text-sm text-mamen-gray-200">
                            Look for the{" "}
                            <span className="inline-block bg-mamen-magenta text-white font-bold text-[0.6rem] px-2 py-0.5 uppercase tracking-wider">
                                Affiliate
                            </span>{" "}
                            badge on product listings.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="bg-mamen-gray-900 py-16 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-headline text-3xl font-black text-mamen-white uppercase mb-4">
                        Get in <span className="text-mamen-lime">Touch</span>
                    </h2>
                    <p className="text-mamen-gray-200 mb-6">
                        Got a tip, collaboration idea, or just want to say hi?
                    </p>
                    <a
                        href="mailto:hello@mamen.id"
                        className="inline-block px-8 py-4 bg-mamen-lime text-mamen-black font-headline font-bold text-sm uppercase tracking-wider border-4 border-mamen-black shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000000] transition-all duration-150"
                    >
                        hello@mamen.id
                    </a>
                </div>
            </section>
        </>
    );
}
