"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, ChevronDown, LogIn, LogOut, User, MessageCircle } from "lucide-react";
import { NAV_CATEGORIES } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";
import SearchOverlay from "./SearchOverlay";
import LoginModal from "./LoginModal";
import UnreadBadge from "./UnreadBadge";
import { useAuth } from "@/lib/auth-context";
import { useUnreadCount } from "@/lib/hooks/useUnreadCount";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const mobileUserMenuRef = useRef<HTMLDivElement>(null);
    const { user, logout, isLoading } = useAuth();
    const { unreadCount } = useUnreadCount();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
            if (mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(event.target as Node)) {
                setMobileUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <nav className="sticky top-0 z-50 bg-mamen-black border-b-[3px] border-mamen-purple">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-1 group shrink-0">
                            <span className="font-headline text-3xl font-black text-mamen-white tracking-tight">
                                MAMEN
                            </span>
                            <span className="font-headline text-3xl font-black text-mamen-purple">.</span>
                        </Link>

                        {/* Desktop Nav with Dropdowns */}
                        <div className="hidden lg:flex items-center gap-6" ref={dropdownRef}>
                            {NAV_CATEGORIES.map((cat) => (
                                <div key={cat.label} className="relative">
                                    {cat.subcategories.length > 0 ? (
                                        <button
                                            onClick={() =>
                                                setOpenDropdown(openDropdown === cat.label ? null : cat.label)
                                            }
                                            className="flex items-center gap-1 font-headline text-sm font-bold tracking-widest text-mamen-gray-200 hover:text-mamen-lime transition-colors duration-200 cursor-pointer"
                                        >
                                            {cat.label.toUpperCase()}
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${openDropdown === cat.label ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    ) : (
                                        <Link
                                            href={cat.href}
                                            className="font-headline text-sm font-bold tracking-widest text-mamen-gray-200 hover:text-mamen-lime transition-colors duration-200"
                                        >
                                            {cat.label.toUpperCase()}
                                        </Link>
                                    )}

                                    {/* Dropdown */}
                                    {openDropdown === cat.label && (
                                        <div className="absolute top-full left-0 mt-3 w-48 bg-mamen-gray-900 border-[3px] border-mamen-purple shadow-hard-purple z-50">
                                            <Link
                                                href={cat.href}
                                                onClick={() => setOpenDropdown(null)}
                                                className="block px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-lime hover:bg-mamen-gray-800 border-b border-mamen-gray-800 transition-colors"
                                            >
                                                All {cat.label}
                                            </Link>
                                            {cat.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={() => setOpenDropdown(null)}
                                                    className="block px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-mamen-white hover:bg-mamen-gray-800 transition-colors"
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <Link
                                href="/barengan"
                                className="flex items-center gap-1.5 font-headline text-sm font-bold tracking-widest text-mamen-gray-200 hover:text-mamen-lime transition-colors duration-200"
                            >
                                BARENGAN
                                <span className="text-[9px] px-1.5 py-0.5 bg-mamen-magenta text-white font-bold rounded-sm leading-none">BETA</span>
                            </Link>

                            <ThemeToggle />

                            {/* Messages Icon (desktop) */}
                            {user && (
                                <Link
                                    href="/messages"
                                    className="relative text-mamen-gray-200 hover:text-mamen-lime transition-colors duration-200"
                                    aria-label="Messages"
                                >
                                    <MessageCircle size={20} />
                                    <UnreadBadge count={unreadCount} />
                                </Link>
                            )}

                            {/* Search Button */}
                            <button
                                aria-label="Search"
                                onClick={() => setSearchOpen(true)}
                                className="text-mamen-gray-200 hover:text-mamen-lime transition-colors duration-200 cursor-pointer"
                            >
                                <Search size={20} />
                            </button>

                            {/* User Auth */}
                            {isLoading ? (
                                <div
                                    className="w-8 h-8 rounded-full bg-mamen-gray-800 border border-mamen-gray-700 animate-pulse"
                                    aria-label="Loading user"
                                />
                            ) : user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-mamen-purple flex items-center justify-center font-headline font-black text-xs text-white overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name[0]
                                            )}
                                        </div>
                                        <span className="font-headline text-xs font-bold text-mamen-gray-200 group-hover:text-mamen-lime transition-colors hidden xl:block">
                                            {user.name}
                                        </span>
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute top-full right-0 mt-3 w-48 bg-mamen-gray-900 border-[3px] border-mamen-purple shadow-hard-purple z-50">
                                            <div className="px-4 py-3 border-b border-mamen-gray-800">
                                                <p className="font-headline text-xs font-bold text-mamen-white">{user.name}</p>
                                                <p className="text-xs text-mamen-gray-700 truncate">{user.email}</p>
                                                {user.role === "admin" && (
                                                    <span className="text-xs text-mamen-purple font-bold uppercase tracking-wider">Admin</span>
                                                )}
                                            </div>
                                            <Link
                                                href={`/profile/${user.handle}`}
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-mamen-white hover:bg-mamen-gray-800 transition-colors"
                                            >
                                                <User size={12} /> Profile
                                            </Link>
                                            {user.role === "admin" && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-mamen-white hover:bg-mamen-gray-800 transition-colors"
                                                >
                                                    <User size={12} /> Admin Panel
                                                </Link>
                                            )}
                                            {(user.role === "admin" || user.role === "contributor") && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-mamen-white hover:bg-mamen-gray-800 transition-colors"
                                                >
                                                    <User size={12} /> Writer Panel
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => { logout(); setUserMenuOpen(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-red-400 hover:bg-mamen-gray-800 transition-colors cursor-pointer"
                                            >
                                                <LogOut size={12} /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setLoginOpen(true)}
                                    className="flex items-center gap-1.5 font-headline text-xs font-bold tracking-widest text-mamen-gray-200 hover:text-mamen-lime transition-colors cursor-pointer"
                                >
                                    <LogIn size={15} /> LOGIN
                                </button>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <div className="lg:hidden flex items-center gap-3">
                            {/* Messages icon (mobile top bar) */}
                            {user && (
                                <Link
                                    href="/messages"
                                    className="relative text-mamen-white hover:text-mamen-lime transition-colors"
                                    aria-label="Messages"
                                >
                                    <MessageCircle size={22} />
                                    <UnreadBadge count={unreadCount} />
                                </Link>
                            )}

                            <button
                                aria-label="Search"
                                onClick={() => setSearchOpen(true)}
                                className="text-mamen-white hover:text-mamen-lime transition-colors"
                            >
                                <Search size={22} />
                            </button>

                            {/* Mobile user avatar / login */}
                            {isLoading ? (
                                <div
                                    className="w-8 h-8 rounded-full bg-mamen-gray-800 border border-mamen-gray-700 animate-pulse"
                                    aria-label="Loading user"
                                />
                            ) : user ? (
                                <div className="relative" ref={mobileUserMenuRef}>
                                    <button
                                        onClick={() => setMobileUserMenuOpen(!mobileUserMenuOpen)}
                                        className="flex items-center shrink-0 cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-mamen-purple flex items-center justify-center font-headline font-black text-xs text-white overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name[0]
                                            )}
                                        </div>
                                    </button>

                                    {mobileUserMenuOpen && (
                                        <div className="absolute top-full right-0 mt-3 w-48 bg-mamen-gray-900 border-[3px] border-mamen-purple shadow-hard-purple z-50">
                                            <div className="px-4 py-3 border-b border-mamen-gray-800">
                                                <p className="font-headline text-xs font-bold text-mamen-white">{user.name}</p>
                                                <p className="text-xs text-mamen-gray-700 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                href={`/profile/${user.handle}`}
                                                onClick={() => setMobileUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-mamen-white hover:bg-mamen-gray-800 transition-colors"
                                            >
                                                <User size={12} /> Profile
                                            </Link>
                                            {(user.role === "admin" || user.role === "contributor") && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setMobileUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-mamen-white hover:bg-mamen-gray-800 transition-colors"
                                                >
                                                    <User size={12} /> {user.role === "admin" ? "Admin Panel" : "Writer Panel"}
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => { logout(); setMobileUserMenuOpen(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-headline font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-red-400 hover:bg-mamen-gray-800 transition-colors cursor-pointer"
                                            >
                                                <LogOut size={12} /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setLoginOpen(true)}
                                    className="text-mamen-white hover:text-mamen-lime transition-colors cursor-pointer"
                                    aria-label="Login"
                                >
                                    <LogIn size={22} />
                                </button>
                            )}

                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="text-mamen-white hover:text-mamen-lime transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="lg:hidden bg-mamen-gray-900 border-t-[3px] border-mamen-purple max-h-[80vh] overflow-y-auto">
                        <div className="px-4 py-4">
                            {/* Theme Toggle at the top */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-mamen-gray-800">
                                <span className="font-headline text-lg font-bold tracking-widest text-mamen-white uppercase">
                                    THEME
                                </span>
                                <ThemeToggle />
                            </div>

                            {NAV_CATEGORIES.map((cat) => (
                                <div key={cat.label} className="mb-4">
                                    {cat.subcategories.length > 0 ? (
                                        <button
                                            onClick={() => setMobileOpenDropdown(mobileOpenDropdown === cat.label ? null : cat.label)}
                                            className="w-full flex items-center justify-between font-headline text-lg font-bold tracking-widest text-mamen-white hover:text-mamen-lime transition-colors cursor-pointer"
                                        >
                                            <span>{cat.label.toUpperCase()}</span>
                                            <ChevronDown
                                                size={18}
                                                className={`transition-transform duration-200 ${mobileOpenDropdown === cat.label ? "rotate-180 text-mamen-lime" : ""}`}
                                            />
                                        </button>
                                    ) : (
                                        <Link
                                            href={cat.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="block font-headline text-lg font-bold tracking-widest text-mamen-white hover:text-mamen-lime transition-colors"
                                        >
                                            {cat.label.toUpperCase()}
                                        </Link>
                                    )}

                                    {/* Submenu Dropdown */}
                                    {mobileOpenDropdown === cat.label && (
                                        <div className="ml-4 mt-2 space-y-2">
                                            <Link
                                                href={cat.href}
                                                onClick={() => { setMobileOpenDropdown(null); setMobileOpen(false); }}
                                                className="block font-headline text-xs font-bold tracking-wider uppercase text-mamen-lime hover:text-mamen-white transition-colors"
                                            >
                                                ALL {cat.label.toUpperCase()}
                                            </Link>
                                            {cat.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={() => { setMobileOpenDropdown(null); setMobileOpen(false); }}
                                                    className="block font-headline text-xs font-bold tracking-wider uppercase text-mamen-gray-200 hover:text-mamen-lime transition-colors"
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Link
                                href="/barengan"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 font-headline text-lg font-bold tracking-widest text-mamen-white hover:text-mamen-lime transition-colors"
                            >
                                BARENGAN
                                <span className="text-[9px] px-1.5 py-0.5 bg-mamen-magenta text-white font-bold rounded-sm leading-none">BETA</span>
                            </Link>

                            {/* Messages link (mobile) */}
                            {user && (
                                <Link
                                    href="/messages"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 font-headline text-lg font-bold tracking-widest text-mamen-white hover:text-mamen-lime transition-colors mt-4"
                                >
                                    <span className="relative">
                                        <MessageCircle size={20} />
                                        <UnreadBadge count={unreadCount} />
                                    </span>
                                    MESSAGES
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
