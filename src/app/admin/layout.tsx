"use client";

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import { useAuth } from "@/lib/auth-context";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    // Links to show in the sidebar/header based on role
    const navLinks = [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/articles", label: "Articles", icon: "📝" },
        { href: "/admin/media", label: "Media", icon: "🖼️" },
    ];
    if (user?.role === "admin") {
        navLinks.push({ href: "/admin/brands", label: "Brands", icon: "🏷️" });
        navLinks.push({ href: "/admin/sponsors", label: "Sponsors", icon: "💼" });
        navLinks.push({ href: "/admin/concerts", label: "Concerts", icon: "🎤" });
        navLinks.push({ href: "/admin/users", label: "Users", icon: "👥" });
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-mamen-gray-900 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-mamen-black border-r-4 border-mamen-purple shrink-0 hidden md:block">
                    <div className="sticky top-0 h-screen flex flex-col">
                        {/* Logo */}
                        <div className="px-6 py-6 border-b border-mamen-gray-800">
                            <Link href="/admin" className="block">
                                <span className="font-headline text-2xl font-black text-mamen-white">
                                    MAMEN<span className="text-mamen-purple">.</span>
                                </span>
                                <span className="block text-xs text-mamen-gray-200 font-headline tracking-widest uppercase mt-1">
                                    Admin Panel
                                </span>
                            </Link>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 px-4 py-6 space-y-1">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-mamen-gray-200 hover:text-mamen-white hover:bg-mamen-gray-800 transition-colors rounded"
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Back to site */}
                        <div className="px-4 py-4 border-t border-mamen-gray-800">
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 text-xs font-headline tracking-wider uppercase text-mamen-gray-200 hover:text-mamen-lime transition-colors"
                            >
                                ← Back to Site
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Mobile header */}
                    <header className="md:hidden bg-mamen-black border-b-4 border-mamen-purple px-4 py-3">
                        <div className="flex items-center justify-between">
                            <Link href="/admin">
                                <span className="font-headline text-xl font-black text-mamen-white">
                                    MAMEN<span className="text-mamen-purple">.</span> Admin
                                </span>
                            </Link>
                            <div className="flex gap-3">
                                {navLinks.map((item) => (
                                    <Link key={item.href} href={item.href} className="text-xs text-mamen-gray-200 hover:text-mamen-lime">
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6 md:p-8">{children}</main>
                </div>
            </div>
        </AdminGuard>
    );
}
