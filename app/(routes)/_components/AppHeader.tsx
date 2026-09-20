"use client"
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import MAPDLogo from '@/app/_components/MAPDLogo'

const MenuOptions = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Questions', path: '/questions' },
    { name: 'Upgrade', path: '/upgrade' },
    { name: 'How it works?', path: '/how-it-works' },
];

function AppHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 lg:px-8 py-3 transition-all shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/dashboard">
                    <MAPDLogo />
                </Link>

                <nav className="flex items-center gap-1 md:gap-2">
                    {MenuOptions.map((option) => {
                        const isActive = pathname === option.path;
                        return (
                            <Link href={option.path} key={option.path}>
                                <span
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 block ${
                                        isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-900/70'
                                    }`}
                                >
                                    {option.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </header>
    );
}

export default AppHeader;