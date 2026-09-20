import React from 'react'

export default function MAPDLogo({ className = "w-8 h-8", textClassName = "text-xl font-bold tracking-tight" }: { className?: string, textClassName?: string }) {
    return (
        <div className="flex items-center gap-2.5 group cursor-pointer select-none">
            <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-2 shadow-md shadow-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/30 ${className}`}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full text-white"
                >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-extrabold ${textClassName}`}>
                    MAPD
                </span>
                <span className="-mt-1 text-[9px] font-semibold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                    AI Interview
                </span>
            </div>
        </div>
    );
}
