"use client"
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { ArrowLeft, ArrowRight, Camera, CameraOff, CheckCircle2, Code, Mic, MicOff, ShieldCheck, Sparkles, Video, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function InterviewPreparationPage() {
    const { interviewId } = useParams();
    const router = useRouter();

    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Fetch session record from Convex
    const record = useQuery(
        api.Interview.GetInterviewQuestions,
        interviewId ? { interviewRecordId: interviewId as any } : "skip"
    );

    // Clean up media tracks on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const enableDevices = async () => {
        setPermissionError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            mediaStreamRef.current = stream;
            setWebcamEnabled(true);
            setMicEnabled(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            toast.success("Camera and Microphone connected!");
        } catch (err: any) {
            console.warn("Device permission error:", err);
            setPermissionError("Camera or microphone permission denied / unavailable.");

            // Fallback audio check only
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = audioStream;
                setMicEnabled(true);
                toast.info("Microphone connected (Voice-only mode).");
            } catch (audioErr) {
                toast.error("Permissions denied. You can still proceed using text input.");
            }
        }
    };

    const questions = record?.interviewQuestions;
    const questionsCount = Array.isArray(questions) ? questions.length : 5;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[calc(100vh-80px)]">
            {/* Header Breadcrumb */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-xs font-semibold">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </Button>
                </Link>
                <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
                    Interview Preparation Stage
                </Badge>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Role Details & Guidelines */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
                        <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4" /> Customized AI Session
                            </span>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                                {record?.jobTitle || "Technical Role Mock Interview"}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {record?.jobDescription || "Practice technical questions tailored to your position."}
                            </p>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                                <span className="text-[10px] text-slate-400 font-semibold block">Experience Level</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {record?.experienceLevel || "1–2 years"}
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                                <span className="text-[10px] text-slate-400 font-semibold block">Total Questions</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {questionsCount} Technical Questions
                                </span>
                            </div>
                        </div>

                        {/* Tech Stack */}
                        {record?.techStack && (
                            <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 space-y-1">
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1">
                                    <Code className="w-3 h-3" /> Targeted Tech Stack
                                </span>
                                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                    {record.techStack}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Guidelines Box */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Interview Guidelines & Privacy
                        </h3>
                        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Answer each question verbally using your mic or by typing in the response panel.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Camera and mic streams remain 100% local to your browser session. No video is stored.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Click <strong>End Call</strong> anytime to complete your interview and generate your AI feedback score.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right: Camera & Microphone Setup Stage */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between mb-4">
                            <span className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-indigo-500" />
                                Device Readiness Check
                            </span>
                            <span className="text-xs text-slate-400 font-normal">Step 2 of 2</span>
                        </h2>

                        {/* Video Stage Box */}
                        <div className="w-full h-64 md:h-72 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center relative text-white shadow-inner">
                            {webcamEnabled ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
                                        <CameraOff size={30} className="text-slate-500" />
                                    </div>
                                    <p className="text-xs text-slate-400 max-w-xs">
                                        Enable your camera and microphone to preview your video feed before starting.
                                    </p>
                                </div>
                            )}

                            {webcamEnabled && (
                                <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                                    <span className="w-2 h-2 rounded-full bg-white animate-ping" /> Camera Live
                                </div>
                            )}
                        </div>

                        {/* Status Badges */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                                webcamEnabled
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-500"
                            }`}>
                                {webcamEnabled ? <Camera className="w-4 h-4 text-emerald-500" /> : <CameraOff className="w-4 h-4" />}
                                <span>Camera: {webcamEnabled ? "Enabled" : "Not Checked"}</span>
                            </div>

                            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                                micEnabled
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-500"
                            }`}>
                                {micEnabled ? <Mic className="w-4 h-4 text-emerald-500" /> : <MicOff className="w-4 h-4" />}
                                <span>Mic: {micEnabled ? "Enabled" : "Not Checked"}</span>
                            </div>
                        </div>

                        {permissionError && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200/50 mt-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {permissionError}
                            </p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-3 pt-2">
                        {!webcamEnabled && (
                            <Button
                                onClick={enableDevices}
                                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-full text-xs py-5"
                            >
                                <Video className="w-4 h-4 mr-2" /> Enable Camera & Microphone
                            </Button>
                        )}

                        <Link href={`/interview/${interviewId}/start`} className="block">
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-sm py-6 shadow-lg shadow-indigo-500/25 cursor-pointer"
                            >
                                Start Interview <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}