"use client"
import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import MAPDLogo from './MAPDLogo'

import ThemeToggle from './ThemeToggle'

function Header() {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Questions', path: '/questions' },
        { name: 'Upgrade', path: '/upgrade' },
        { name: 'How it works?', path: '/how-it-works' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3.5 transition-all">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/">
                    <MAPDLogo />
                </Link>

                <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-900/70 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-800/60">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path;
                        return (
                            <Link key={link.path} href={link.path}>
                                <span
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 block ${
                                        isActive
                                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    {link.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm" className="text-xs font-semibold">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-full shadow-md shadow-indigo-500/20 px-4">
                                Get Started
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button size="sm" variant="outline" className="text-xs font-semibold rounded-full border-slate-300 dark:border-slate-700">
                                Dashboard
                            </Button>
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}

export default Header