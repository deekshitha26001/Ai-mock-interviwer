import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                <FileQuestion size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
            <p className="text-xs text-slate-500 max-w-md">
                The requested page does not exist or has been moved.
            </p>
            <Link href="/">
                <Button size="sm" className="rounded-full bg-indigo-600 text-white font-semibold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Button>
            </Link>
        </div>
    );
}
