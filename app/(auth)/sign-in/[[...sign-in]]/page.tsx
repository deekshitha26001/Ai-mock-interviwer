"use client"
import { SignIn } from '@clerk/nextjs'
import React from 'react'
import MAPDLogo from '@/app/_components/MAPDLogo'

export default function SignInPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 space-y-6">
            <div className="mb-2">
                <MAPDLogo textClassName="text-2xl font-extrabold" />
            </div>
            <SignIn
                appearance={{
                    elements: {
                        card: "shadow-xl border border-slate-200 dark:border-slate-800 rounded-3xl",
                    }
                }}
            />
        </div>
    );
}