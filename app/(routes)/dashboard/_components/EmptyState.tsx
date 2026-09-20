import React from 'react'
import CreateInterviewDialog from '../../_components/CreateInterviewDialog'
import { Sparkles, Video } from 'lucide-react'

function EmptyState() {
    return (
        <div className="mt-10 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Video className="w-8 h-8" />
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Start your first mock interview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Select a target job role or upload your resume PDF to generate personalized technical interview questions.
                </p>
            </div>
            <div className="pt-2">
                <CreateInterviewDialog />
            </div>
        </div>
    );
}

export default EmptyState;