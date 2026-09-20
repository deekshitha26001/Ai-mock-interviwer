"use client"

import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center space-y-4">
                <h2 className="text-2xl font-bold">Application System Error</h2>
                <p className="text-xs text-slate-400 max-w-md">
                    {error?.message || "An unexpected system error occurred."}
                </p>
                <Button onClick={() => reset()} size="sm" className="rounded-full bg-indigo-600 text-white font-semibold">
                    Reload Application
                </Button>
            </body>
        </html>
    );
}
