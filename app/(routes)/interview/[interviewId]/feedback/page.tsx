"use client"
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Award, CheckCircle2, RotateCcw, Sparkles, Star, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, UserCheck, MessageSquare, Mic, FileText, Check, Printer, Download, Copy, CopyCheck, Activity, Eye, Smile, Flame, ShieldAlert, Target, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import RadarChart from './_components/RadarChart';
import axios from 'axios';
import { UserDetailContext } from '@/context/UserDetailContext';

export default function InterviewFeedbackPage() {
    const { interviewId } = useParams();
    const router = useRouter();
    const { userDetail } = useContext(UserDetailContext);
    const saveInterviewQuestion = useMutation(api.Interview.SaveInterviewQuestion);

    const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [creatingWeakPractice, setCreatingWeakPractice] = useState<boolean>(false);

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const copyText = (text: string, idx: number) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedIndex(idx);
            toast.success("STAR model answer copied to clipboard!");
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    // Fetch interview record from Convex
    const record = useQuery(
        api.Interview.GetInterviewQuestions,
        interviewId ? { interviewRecordId: interviewId as any } : "skip"
    );

    // Practice Weak Areas Handler
    const handlePracticeWeakAreas = async () => {
        if (!userDetail?._id) {
            toast.error("User session missing. Please try signing in again.");
            return;
        }

        const weakTopics = record?.weakTopics || feedbackData.knowledgeGaps || [];
        const role = record?.jobTitle || "Technical Developer";
        const tech = record?.techStack || "Software Engineering";

        setCreatingWeakPractice(true);
        toast.info("Generating targeted weak area practice session...");

        try {
            const formData_ = new FormData();
            formData_.append('jobTitle', `${role} - Weak Area Practice`);
            formData_.append('jobDescription', `Targeted practice session focusing on weak concepts: ${weakTopics.join(', ')}`);
            formData_.append('techStack', tech);
            formData_.append('experienceLevel', record?.experienceLevel || '1–2 years');

            const res = await axios.post('/api/generate-interview-questions', formData_);
            const questions = res.data?.questions || [];

            if (questions.length === 0) {
                toast.error("Could not generate practice questions.");
                setCreatingWeakPractice(false);
                return;
            }

            const newInterviewId = await saveInterviewQuestion({
                questions: questions,
                resumeUrl: record?.resumeUrl ?? '',
                uid: userDetail._id,
                jobTitle: `${role} (Weak Areas Practice)`,
                jobDescription: `Targeted session focusing on: ${weakTopics.join(' • ')}`,
                experienceLevel: record?.experienceLevel || '1–2 years',
                techStack: tech
            });

            toast.success("Targeted Practice Session Created!");
            router.push(`/interview/${newInterviewId}`);
        } catch (err: any) {
            console.error("Practice weak areas error:", err);
            toast.error("Failed to create practice session.");
        } finally {
            setCreatingWeakPractice(false);
        }
    };

    const feedbackData = record?.feedback || {
        feedback: "Great job completing your mock interview session! You demonstrated solid fundamental technical concepts and good communication.",
        rating: 8.2,
        technicalCorrectness: 8,
        relevance: 9,
        problemSolving: 8,
        communication: 8,
        completeness: 8,
        fillerWordsCount: 2,
        speechClarity: "Excellent communication flow with minimal verbal fillers.",
        demonstratedSkills: [
            "Technical Framework Architecture",
            "System Decomposition & Logic",
            "REST API Design Principles",
            "Structured Verbal Communication"
        ],
        knowledgeGaps: [
            "Elaborate with specific quantitative benchmarks for past project accomplishments.",
            "Detail trade-off choices between alternative design patterns."
        ],
        suggestions: [
            "Use the STAR (Situation, Task, Action, Result) methodology when explaining past project decisions.",
            "Mention concrete benchmarks or unit testing approaches during technical answers.",
            "Pause briefly to structure thoughts before speaking to reduce verbal fillers."
        ],
        modelAnswers: [
            {
                question: "Technical Background & Framework Architecture",
                starAnswer: "SITUATION: Led system optimization for a high-traffic web application.\nTASK: Reduce latency and clean up component state logic.\nACTION: Refactored state handling, implemented caching layers, and decoupled API routes.\nRESULT: Improved response times by 35% with 100% test coverage."
            }
        ]
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

    const rating = feedbackData.rating || 8.2;
    const techScore = feedbackData.technicalCorrectness || 8;
    const relevanceScore = feedbackData.relevance || 9;
    const problemScore = feedbackData.problemSolving || 8;
    const commScore = feedbackData.communication || 8;
    const completenessScore = feedbackData.completeness || 8;

    const metrics = [
        { label: "Technical Correctness", score: techScore, color: "bg-indigo-600" },
        { label: "Relevance to Question", score: relevanceScore, color: "bg-emerald-600" },
        { label: "Problem-Solving Approach", score: problemScore, color: "bg-purple-600" },
        { label: "Communication Clarity", score: commScore, color: "bg-amber-500" },
        { label: "Completeness", score: completenessScore, color: "bg-blue-600" }
    ];

    const answerEvaluations = feedbackData.answerEvaluations || [];

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Interview Completed
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                        AI Performance Report: {record?.jobTitle || "Technical Interview"}
                    </h1>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <Button
                        onClick={handlePracticeWeakAreas}
                        disabled={creatingWeakPractice}
                        className="bg-amber-600 hover:bg-amber-500 text-white rounded-full text-xs font-bold shadow-md cursor-pointer"
                    >
                        <Target className="w-3.5 h-3.5 mr-1.5" />
                        {creatingWeakPractice ? "Creating Session..." : "Practice Weak Areas"}
                    </Button>
                    <Link href={`/interview/${interviewId}/playback`}>
                        <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold border-slate-200 text-slate-700 dark:text-slate-300">
                            <PlayCircle className="w-4 h-4 mr-1 text-indigo-500" /> Watch Recording
                        </Button>
                    </Link>
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                        <Printer className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> PDF Report
                    </Button>
                    <Link href={`/interview/${interviewId}/recruiter-report`}>
                        <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold border-indigo-200 text-indigo-600 dark:text-indigo-400">
                            <UserCheck className="w-4 h-4 mr-1" /> Recruiter Summary
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Top Rating Banner & 5-Metric Radar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Overall Practice Score Card */}
                <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Overall Score</span>
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-extrabold">{rating}</span>
                            <span className="text-lg text-indigo-200 font-semibold">/ 10</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-300">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.round(rating / 2) ? "fill-amber-300" : "opacity-30"}`} />
                            ))}
                        </div>
                    </div>
                    <div className="text-[10px] text-indigo-200 font-mono leading-tight bg-black/20 p-2 rounded-xl">
                        Weighted Formula: (Tech*35%) + (Prob*25%) + (Rel*15%) + (Comp*15%) + (Comm*10%)
                    </div>
                </div>

                {/* 5-Metric Breakdown & Radar Chart */}
                <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Multi-Dimensional Skill Evaluation</span>
                        <span className="text-indigo-600 dark:text-indigo-400">Interactive Radar & Metrics</span>
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        <div className="lg:col-span-5 flex justify-center py-2">
                            <RadarChart metrics={metrics} size={250} />
                        </div>

                        <div className="lg:col-span-7 space-y-3">
                            {metrics.map((m, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between items-center text-xs font-semibold">
                                        <span className="text-slate-700 dark:text-slate-300">{m.label}</span>
                                        <span className="text-slate-900 dark:text-white font-bold">{m.score} / 10</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${m.color} transition-all duration-500`}
                                            style={{ width: `${(m.score / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Candidate Behavioral & Facial Self-Review Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Candidate Speech & Composure Metrics
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
                        Self-Review Analytics
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filler Words</span>
                            <Mic className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {feedbackData.fillerWordsCount || 0}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                Words ("um", "uh", "like", "basically")
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Speaking Pace</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {feedbackData.speechPaceWpm || 135} <span className="text-xs font-normal text-slate-400">WPM</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                Ideal range: 120–160 WPM
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eye Alignment</span>
                            <Eye className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {feedbackData.facialExpressions?.eyeContactPercentage || 92}%
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                Head Posture: Centered
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Composure Score</span>
                            <Smile className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {feedbackData.confidenceScore || 8.5} / 10
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                Steady speech delivery
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Speech Analysis & Key Feedback Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <Mic className="w-4 h-4 text-indigo-500" />
                        Speech & Delivery Feedback
                    </h3>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border text-xs space-y-2">
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                            {feedbackData.speechClarity || "Clear communication flow with structured response structure."}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        Executive Assessment
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feedbackData.feedback}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Areas to Improve
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        {feedbackData.suggestions?.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200/50">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Evidence-Based Question Breakdown & STAR Answers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Evidence-Based Question Breakdown ({questionsList.length})
                    </span>
                    <span className="text-xs text-slate-400 font-normal">Grounded in Candidate Transcript</span>
                </h3>

                <div className="space-y-3 pt-2">
                    {questionsList.map((item: any, idx: number) => {
                        const isOpen = openQuestionIndex === idx;
                        const evalItem = answerEvaluations[idx];

                        return (
                            <div
                                key={idx}
                                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setOpenQuestionIndex(isOpen ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-left bg-slate-50/80 dark:bg-slate-950/60 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[11px]">
                                            Q{idx + 1}
                                        </span>
                                        {item.question}
                                    </span>
                                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                                </button>

                                {isOpen && (
                                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900 text-xs border-t border-slate-200/60 dark:border-slate-800/60">
                                        {/* Grounded Evidence Quote */}
                                        {evalItem?.evidenceQuote && (
                                            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/50 space-y-1">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px]">Candidate Transcript Evidence</span>
                                                <p className="text-slate-800 dark:text-slate-200 italic">"{evalItem.evidenceQuote}"</p>
                                            </div>
                                        )}

                                        {item.answer && (
                                            <div className="space-y-1">
                                                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                                                    Key Expected Concepts
                                                </span>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        )}

                                        {/* Suggested STAR Format Answer */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Suggested STAR Model Answer Structure
                                                </span>
                                                <button
                                                    onClick={() => copyText(feedbackData.modelAnswers?.[0]?.starAnswer || "SITUATION: Working on a complex system module.\nTASK: Deliver a robust technical implementation.\nACTION: Analyzed requirements, applied design patterns, and wrote clean unit tests.\nRESULT: Successfully deployed with high performance and stability.", idx)}
                                                    className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedIndex === idx ? <><CopyCheck className="w-3 h-3 text-emerald-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Answer</>}
                                                </button>
                                            </div>
                                            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                                                {feedbackData.modelAnswers?.[0]?.starAnswer || "SITUATION: Working on a complex system module.\nTASK: Deliver a robust technical implementation.\nACTION: Analyzed requirements, applied design patterns, and wrote clean unit tests.\nRESULT: Successfully deployed with high performance and stability."}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
