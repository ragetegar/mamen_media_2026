import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-mamen-black border-t-4 border-mamen-purple">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="inline-block">
                            <span className="font-headline text-4xl font-black text-mamen-white">
                                MAMEN<span className="text-mamen-purple">.</span>
                            </span>
                        </Link>
                        <p className="mt-4 text-mamen-gray-200 text-sm leading-relaxed max-w-md">
                            Your go-to platform for Indonesian music, concert culture, and everything that moves the crowd. We live for the scene.
                        </p>
                        <div className="flex gap-1 mt-6">
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center text-mamen-gray-200 hover:border-mamen-lime hover:text-mamen-lime transition-colors"
                                aria-label="Instagram"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center text-mamen-gray-200 hover:border-mamen-lime hover:text-mamen-lime transition-colors"
                                aria-label="X / Twitter"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center text-mamen-gray-200 hover:border-mamen-lime hover:text-mamen-lime transition-colors"
                                aria-label="TikTok"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.56a8.28 8.28 0 0 0 3.76.94V6.05a4.84 4.84 0 0 1-1-.36v1z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-headline text-sm font-bold tracking-widest text-mamen-lime mb-4">
                            EXPLORE
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { href: "/music", label: "Music" },
                                { href: "/lifestyle", label: "Lifestyle" },
                                { href: "/sports", label: "Sports" },
                                { href: "/hobbies", label: "Hobbies" },
                                { href: "/concerts", label: "Concerts" },
                                { href: "/barengan", label: "Barengan" },
                                { href: "/about", label: "About" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-mamen-gray-200 hover:text-mamen-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-headline text-sm font-bold tracking-widest text-mamen-lime mb-4">
                            SUPPORT
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { href: "/about", label: "Contact Us" },
                                { href: "/about", label: "FAQ" },
                                { href: "/about", label: "Privacy Policy" },
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link
                                        href={link.href}
                                        className="text-mamen-gray-200 hover:text-mamen-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Affiliate Disclosure */}
                <div className="mt-12 pt-8 border-t border-mamen-gray-800">
                    <p className="text-mamen-gray-700 text-xs leading-relaxed">
                        <span className="text-mamen-magenta font-bold">Affiliate Disclosure:</span> Mamen.id
                        may earn commission from affiliate links in our articles. This doesn&apos;t affect our
                        editorial independence — we only recommend products we genuinely believe in.
                    </p>
                </div>

                {/* Copyright */}
                <div className="mt-6 pt-6 border-t border-mamen-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-mamen-gray-700 text-xs">
                        © 2026 Mamen.id. All rights reserved.
                    </p>
                    <p className="text-mamen-gray-700 text-xs">
                        Made with 🔥 from Jakarta
                    </p>
                </div>
            </div>
        </footer>
    );
}
