'use client';

import Link from 'next/link';
import { ConnectWalletButton } from './ConnectWalletButton';
import { useWallet } from '@/contexts/WalletContext';
import { Newspaper, PenSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const { isConnected } = useWallet();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                            <Newspaper className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                            MicroNews
                        </span>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/"
                            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 
                         rounded-lg transition-all text-sm font-medium"
                        >
                            Explore
                        </Link>
                        <Link
                            href="/library"
                            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 
                         rounded-lg transition-all text-sm font-medium"
                        >
                            Library
                        </Link>
                        {isConnected && (
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 
                           rounded-lg transition-all text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {isConnected && (
                            <Link
                                href="/dashboard/write"
                                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white 
                           text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all
                           shadow-sm hover:shadow-md"
                            >
                                <PenSquare className="w-4 h-4" />
                                Publish
                            </Link>
                        )}
                        <ConnectWalletButton />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200">
                        <div className="flex flex-col gap-1">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                            >
                                Explore
                            </Link>
                            <Link
                                href="/library"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                            >
                                Library
                            </Link>
                            {isConnected && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/write"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                                    >
                                        ✍️ Publish Article
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
