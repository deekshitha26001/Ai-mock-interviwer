"use client"
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Play, Pause, Volume2, Clock, Sparkles, MessageSquare, CheckCircle2, UserCheck, Video, HelpCircle, AlertCircle, Loader2, Download, Trash2, ShieldCheck, Database, HardDrive } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteCloudRecording, getRecordingPlaybackUrl } from '@/utils/recordingStorage';
import { toast } from 'sonner';

export default function InterviewPlaybackPage() {
    const { interviewId } = useParams();
    const router = useRouter();

    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [loadingVideo, setLoadingVideo] = useState<boolean>(true);
    const [deletingVideo, setDeletingVideo] = useState<boolean>(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const deleteInterviewRecording = useMutation(api.Interview.DeleteInterviewRecording);

    // Fetch session record from Convex
    const record = useQuery(
        api.Interview.GetInterviewQuestions,
        interviewId ? { interviewRecordId: interviewId as any } : "skip"
    );

    // Load recorded video blob or persistent URL
    useEffect(() => {
        let isMounted = true;
        async function loadRecording() {
            if (!interviewId) return;
            setLoadingVideo(true);
            try {
                const url = await getRecordingPlaybackUrl(interviewId as string, record?.recordingUrl);
                if (isMounted) {
                    setVideoSrc(url);
                }
            } catch (e) {
                console.warn("Failed to load interview video:", e);
            } finally {
                if (isMounted) setLoadingVideo(false);
            }
        }

        loadRecording();

        return () => {
            isMounted = false;
        };
    }, [interviewId, record?.recordingUrl]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
        }
    };

    const jumpToTimestamp = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = seconds;
            videoRef.current.play();
            setIsPlaying(true);
            toast.info(`Jumped to ${formatTime(seconds)}`);
        }
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes?: number | null): string => {
        if (!bytes) return "N/A";
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    // Download video file handler
    const handleDownloadRecording = () => {
        if (!videoSrc) {
            toast.error("No video file available to download.");
            return;
        }
        const a = document.createElement("a");
        a.href = videoSrc;
        a.download = `MAPD_Interview_${record?.jobTitle || "Session"}_${interviewId}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Recording download started!");
    };

    // Delete recording file handler
    const handleDeleteRecording = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this video recording file from storage? The transcript and evaluation report will remain intact.")) {
            return;
        }

        setDeletingVideo(true);
        try {
            // Delete from persistent cloud/server storage
            await deleteCloudRecording(
                interviewId as string,
                record?.recordingUrl,
                record?.recordingId,
                record?.storageProvider
            );

            // Clear recording reference in Convex
            await deleteInterviewRecording({
                recordId: interviewId as any
            });

            setVideoSrc(null);
            toast.success("Video recording permanently deleted from storage.");
        } catch (err) {
            console.error("Delete recording error:", err);
            toast.error("Failed to delete recording file.");
        } finally {
            setDeletingVideo(false);
        }
    };

    let questionsList: any[] = [];
    if (Array.isArray(record?.interviewQuestions)) {
        questionsList = record.interviewQuestions;
    } else if (typeof record?.interviewQuestions === 'string') {
        try {
            const parsed = JSON.parse(record.interviewQuestions);
            questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        } catch {
            questionsList = [];
        }
    }

    const timestamps: any[] = record?.questionTimestamps || questionsList.map((q, idx) => ({
        questionIndex: idx,
        question: typeof q === 'string' ? q : q.question,
        timestampSeconds: idx * 90,
        formattedTime: formatTime(idx * 90)
    }));

    const candidateAnswers: any[] = record?.candidateAnswers || [];

    if (!record) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading saved interview recording...</h2>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="text-xs font-semibold">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
                            </Button>
                        </Link>
                        <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
                            Interview Review & Persistent Playback
                        </Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                        {record.jobTitle || "Technical Role Interview Playback"}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Recorded on: {new Date(record._creationTime).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • Duration: {formatTime(record.durationSeconds || duration || 600)} • File Size: {formatFileSize(record.fileSize)}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {videoSrc && (
                        <Button
                            onClick={handleDownloadRecording}
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs font-semibold border-slate-200 text-slate-700 dark:text-slate-300"
                        >
                            <Download className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Download Video
                        </Button>
                    )}

                    {videoSrc && (
                        <Button
                            onClick={handleDeleteRecording}
                            disabled={deletingVideo}
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs font-semibold border-rose-200 text-rose-600 dark:text-rose-400 hover:bg-rose-50"
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" /> Delete Recording
                        </Button>
                    )}

                    <Link href={`/interview/${interviewId}/feedback`}>
                        <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold border-indigo-200 text-indigo-600 dark:text-indigo-400">
                            View Report & Evaluation
                        </Button>
                    </Link>
                    <Link href={`/interview/${interviewId}`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold shadow-md">
                            Retry Interview
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT SIDE: Video Player Stage (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col items-center justify-center min-h-[360px]">
                        {videoSrc ? (
                            <video
                                ref={videoRef}
                                src={videoSrc}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={() => setIsPlaying(false)}
                                controls
                                className="w-full h-auto max-h-[480px] object-contain"
                            />
                        ) : loadingVideo ? (
                            <div className="p-12 text-center text-white space-y-3">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                                <p className="text-xs text-slate-400">Retrieving video recording stream...</p>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-white space-y-3">
                                <Video className="w-12 h-12 text-slate-600 mx-auto" />
                                <h3 className="text-sm font-bold text-slate-300">Video Recording Deleted or Unavailable</h3>
                                <p className="text-xs text-slate-500 max-w-sm">
                                    The video recording file was deleted or is unavailable. Your full session transcript and performance evaluation report remain accessible below.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Storage Info Banner */}
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl p-4 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>Storage Provider: <strong>{record.storageProvider?.toUpperCase() || "PERSISTENT CLOUD STORAGE"}</strong> ({formatFileSize(record.fileSize)})</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300/50">
                            Survives Refresh & Login
                        </span>
                    </div>
                </div>

                {/* RIGHT SIDE: Questions Timeline & Transcript (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Timestamp Navigation List */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            Question Timestamp Markers
                        </h3>

                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                            {timestamps.map((item, idx) => {
                                const isActive = currentTime >= item.timestampSeconds && (idx === timestamps.length - 1 || currentTime < (timestamps[idx + 1]?.timestampSeconds || Number.MAX_VALUE));
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => jumpToTimestamp(item.timestampSeconds || idx * 90)}
                                        className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                                            isActive
                                                ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 shadow-xs"
                                                : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-100"
                                        }`}
                                    >
                                        <span className="bg-indigo-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                                            {item.formattedTime || formatTime(item.timestampSeconds || idx * 90)}
                                        </span>
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Question {idx + 1}</span>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                                                {item.question}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Candidate Answers Transcript */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-500" />
                            Candidate Answer Transcripts
                        </h3>

                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                            {candidateAnswers.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">
                                    No candidate response transcripts recorded for this session.
                                </p>
                            ) : (
                                candidateAnswers.map((ans, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border text-xs space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                            <span>Q{idx + 1}: {ans.question}</span>
                                            <span>{formatTime(ans.timestampSeconds)}</span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                                            "{ans.answer}"
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
