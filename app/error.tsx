"use client"

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Next.js Application Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong!</h2>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                {error?.message || "An unexpected error occurred. Please try refreshing."}
            </p>
            <Button onClick={() => reset()} size="sm" className="rounded-full bg-indigo-600 text-white font-semibold">
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
        </div>
    );
}
