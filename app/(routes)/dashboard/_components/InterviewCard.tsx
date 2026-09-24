"use client"
import React, { useState } from 'react'
import { InterviewData } from '../../interview/[interviewId]/start/page'
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle2, Clock, Code, Trash2, Award, FileText, Play, PlayCircle, MessageSquare, RotateCcw, Download } from 'lucide-react'
import Link from 'next/link'
import FeedbackDialog from './FeedbackDialog'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import { deleteCloudRecording, getRecordingPlaybackUrl } from '@/utils/recordingStorage'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
    interviewInfo: InterviewData;
    onDeleteSuccess?: () => void;
}

function InterviewCard({ interviewInfo, onDeleteSuccess }: Props) {
    const [deleting, setDeleting] = useState(false);
    const [transcriptOpen, setTranscriptOpen] = useState(false);
    const deleteInterview = useMutation(api.Interview.DeleteInterview);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this interview session and permanently remove its video file from storage?")) return;
        setDeleting(true);
        try {
            // Delete video from cloud/server storage
            await deleteCloudRecording(
                interviewInfo._id,
                interviewInfo.recordingUrl,
                interviewInfo.recordingId,
                interviewInfo.storageProvider
            );
            // Delete session record from Convex DB
            await deleteInterview({ recordId: interviewInfo._id as any });
            toast.success("Interview session and recording file permanently deleted.");
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (e) {
            console.error("Delete error:", e);
            toast.error("Could not delete interview.");
        } finally {
            setDeleting(false);
        }
    };

    const handleDownloadVideo = async () => {
        const url = await getRecordingPlaybackUrl(interviewInfo._id, interviewInfo.recordingUrl);
        if (!url) {
            toast.error("No video recording file found for this session.");
            return;
        }
        const a = document.createElement("a");
        a.href = url;
        a.download = `MAPD_Interview_${interviewInfo.jobTitle || "Session"}_${interviewInfo._id}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Downloading recording file...");
    };

    const formattedDate = (interviewInfo as any)._creationTime
        ? new Date((interviewInfo as any)._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent';

    const isCompleted = interviewInfo.status === 'complete';
    const rating = interviewInfo.feedback?.rating;

    let questionsList: any[] = [];
    if (Array.isArray(interviewInfo.interviewQuestions)) {
        questionsList = interviewInfo.interviewQuestions;
    } else if (typeof interviewInfo.interviewQuestions === 'string') {
        try {
            const parsed = JSON.parse(interviewInfo.interviewQuestions);
            questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        } catch {
            questionsList = [];
        }
    }

    const candidateAnswers: any[] = interviewInfo.candidateAnswers || [];

    return (
        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-0.5">
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
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px]"
                        }>
                            {isCompleted ? "Completed" : "Draft"}
                        </Badge>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition cursor-pointer"
                            title="Delete Interview & Media Storage"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Description & Stats */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {interviewInfo.jobDescription || (interviewInfo.resumeUrl ? "AI-generated technical questions from uploaded PDF resume." : "Role practice session.")}
                </p>

                <div className="flex items-center gap-3 mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {questionsList.length} Questions
                    </span>
                    {rating !== undefined && (
                        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px] ml-auto">
                            <Award className="w-3 h-3" /> Score: {rating}/10
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 flex-wrap">
                    {/* View Report */}
                    {isCompleted && (
                        <Link href={`/interview/${interviewInfo._id}/feedback`}>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-xl border-slate-200 text-slate-700 dark:text-slate-300">
                                <FileText className="w-3 h-3 mr-1 text-indigo-500" /> Report
                            </Button>
                        </Link>
                    )}

                    {/* Watch Recording */}
                    {isCompleted && (
                        <Link href={`/interview/${interviewInfo._id}/playback`}>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-xl border-slate-200 text-slate-700 dark:text-slate-300">
                                <PlayCircle className="w-3 h-3 mr-1 text-rose-500" /> Watch
                            </Button>
                        </Link>
                    )}

                    {/* Download Recording */}
                    {isCompleted && interviewInfo.recordingUrl && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDownloadVideo}
                            className="text-[11px] h-7 px-2 text-slate-600 dark:text-slate-400 hover:text-emerald-500"
                            title="Download recorded video webm file"
                        >
                            <Download className="w-3 h-3" />
                        </Button>
                    )}

                    {/* View Transcript Modal */}
                    <Dialog open={transcriptOpen} onOpenChange={setTranscriptOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-[11px] h-7 px-2 text-slate-500">
                                <MessageSquare className="w-3 h-3 mr-1" /> Transcript
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[540px] rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <DialogHeader>
                                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                                    Interview Transcript ({questionsList.length} Questions)
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 mt-2 text-xs">
                                {candidateAnswers.length > 0 ? (
                                    candidateAnswers.map((ans, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border space-y-1">
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                                                Q{idx + 1}: {ans.question}
                                            </span>
                                            <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/50">
                                                "{ans.answer}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    questionsList.map((q, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border space-y-1">
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                                                Q{idx + 1}: {typeof q === 'string' ? q : q.question}
                                            </span>
                                            {q.answer && <p className="text-slate-500 text-[11px]">Expected Focus: {q.answer}</p>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Retry Interview Button */}
                <Link href={`/interview/${interviewInfo._id}`}>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs h-7 px-3 cursor-pointer ml-auto">
                        <RotateCcw className="w-3 h-3 mr-1" /> Retry
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default InterviewCard;