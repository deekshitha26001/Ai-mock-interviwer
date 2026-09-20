"use client"
import React, { useState } from 'react'
import { InterviewData } from '../../interview/[interviewId]/start/page'
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, CheckCircle2, Clock, Code, Trash2, Award, FileText, Play } from 'lucide-react'
import Link from 'next/link'
import FeedbackDialog from './FeedbackDialog'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'

type Props = {
    interviewInfo: InterviewData;
    onDeleteSuccess?: () => void;
}

function InterviewCard({ interviewInfo, onDeleteSuccess }: Props) {
    const [deleting, setDeleting] = useState(false);
    const deleteInterview = useMutation(api.Interview.DeleteInterview);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this interview session?")) return;
        setDeleting(true);
        try {
            await deleteInterview({ recordId: interviewInfo._id as any });
            toast.success("Interview session deleted.");
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (e) {
            console.error("Delete error:", e);
            toast.error("Could not delete interview.");
        } finally {
            setDeleting(false);
        }
    };

    const formattedDate = (interviewInfo as any)._creationTime
        ? new Date((interviewInfo as any)._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent';

    const isCompleted = interviewInfo.status === 'complete';
    const rating = interviewInfo.feedback?.rating;

    return (
        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
            <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Code className="w-3 h-3" />
                            {interviewInfo.techStack || interviewInfo.experienceLevel || "Technical Interview"}
                        </span>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition">
                            {interviewInfo.jobTitle || (interviewInfo.resumeUrl ? 'Resume Interview' : 'Technical Role')}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={isCompleted ? "default" : "secondary"} className={
                            isCompleted
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }>
                            {isCompleted ? "Completed" : "Draft"}
                        </Badge>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition"
                            title="Delete Interview"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {interviewInfo.jobDescription || (interviewInfo.resumeUrl ? "AI-generated technical questions from uploaded PDF resume." : "Role practice session.")}
                </p>
            </div>

            {/* Footer Row */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formattedDate}
                    </span>
                    {rating !== undefined && (
                        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px]">
                            <Award className="w-3 h-3" />
                            Score: {rating}/10
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {interviewInfo.feedback && <FeedbackDialog feedbackInfo={interviewInfo.feedback} />}
                    <Link href={`/interview/${interviewInfo._id}`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs shadow-xs px-3.5">
                            <Play className="w-3 h-3 mr-1" /> Start
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default InterviewCard;