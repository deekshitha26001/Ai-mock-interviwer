"use client"
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import {
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    Star,
    TrendingUp,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    UserCheck,
    Mic,
    Printer,
    Check,
    Copy,
    CopyCheck,
    Activity,
    Eye,
    Smile,
    Target,
    PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
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

        const weakTopics = record?.weakTopics || record?.feedback?.knowledgeGaps || [];
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

    if (record === undefined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <Sparkles className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs text-slate-500 font-semibold">Loading performance report...</p>
            </div>
        );
    }

    if (!record || !record.feedback) {
        return (
            <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Evaluation Unavailable</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                    This interview session does not have an evaluated performance report yet or the evaluation failed.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                    <Link href={`/interview/${interviewId}/start`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold cursor-pointer">
                            Resume / Retake Interview
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline" className="rounded-full text-xs font-semibold cursor-pointer">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const feedbackData = record.feedback;
    const isIncomplete = record?.status === 'incomplete' || feedbackData.isComplete === false;

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

    const answeredCount = feedbackData.answeredCount ?? (record?.candidateAnswers?.length || 0);
    const totalQuestionsCount = questionsList.length || feedbackData.totalQuestions || 8;

    const rating = typeof feedbackData.rating === 'number' ? feedbackData.rating : 0;
    const techScore = typeof feedbackData.technicalCorrectness === 'number' ? feedbackData.technicalCorrectness : 0;
    const relevanceScore = typeof feedbackData.relevance === 'number' ? feedbackData.relevance : 0;
    const problemScore = typeof feedbackData.problemSolving === 'number' ? feedbackData.problemSolving : 0;
    const commScore = typeof feedbackData.communication === 'number' ? feedbackData.communication : 0;
    const completenessScore = typeof feedbackData.completeness === 'number' ? feedbackData.completeness : 0;

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
                    {isIncomplete ? (
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 w-fit">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Incomplete Interview ({answeredCount} of {totalQuestionsCount} Questions Answered)
                        </span>
                    ) : (
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 w-fit">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Interview Completed (All {totalQuestionsCount} Questions)
                        </span>
                    )}
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

            {/* Incomplete Interview Notice Banner */}
            {isIncomplete && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs text-amber-800 dark:text-amber-200">
                        <span className="font-bold block">Incomplete Interview Notice</span>
                        <p className="leading-relaxed">
                            This interview was ended early after answering {answeredCount} of {totalQuestionsCount} questions. Unanswered questions are marked as &ldquo;Not answered&rdquo; and received 0 points. Evaluated metrics reflect only the candidate&apos;s actual submitted answers.
                        </p>
                    </div>
                </div>
            )}

            {/* Top Rating Banner & 5-Metric Radar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Overall Practice Score Card */}
                <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Overall Score</span>
                        {isIncomplete && (
                            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                                Incomplete
                            </span>
                        )}
                    </div>
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
                        Formula: Tech (35%) + Rel (25%) + Problem (15%) + Comm (15%) + Comp (10%)
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
                                            style={{ width: `${Math.max(0, Math.min(100, (m.score / 10) * 100))}%` }}
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
                                Words (&quot;um&quot;, &quot;uh&quot;, &quot;like&quot;, &quot;basically&quot;)
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
                                {feedbackData.speechPaceWpm || 0} <span className="text-xs font-normal text-slate-400">WPM</span>
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
                                {feedbackData.facialExpressions?.eyeContactPercentage || 0}%
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                Head Posture: Centered
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence Score</span>
                            <Smile className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {feedbackData.confidenceScore || 0} / 10
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                                Speech composure evaluation
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
                        Evidence-Based Question Breakdown ({questionsList.length} Questions)
                    </span>
                    <span className="text-xs text-slate-400 font-normal">Grounded in Candidate Transcript</span>
                </h3>

                <div className="space-y-3 pt-2">
                    {questionsList.map((item: any, idx: number) => {
                        const isOpen = openQuestionIndex === idx;
                        const evalItem = answerEvaluations[idx] || answerEvaluations.find((e: any) => e.questionIndex === idx + 1);
                        const isAnswered = evalItem?.isAnswered ?? false;

                        return (
                            <div
                                key={idx}
                                className={`border rounded-2xl overflow-hidden transition-all ${
                                    isAnswered ? "border-slate-200 dark:border-slate-800" : "border-amber-200 dark:border-amber-900/60"
                                }`}
                            >
                                <button
                                    onClick={() => setOpenQuestionIndex(isOpen ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-left bg-slate-50/80 dark:bg-slate-950/60 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                            isAnswered
                                                ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                        }`}>
                                            Q{idx + 1}
                                        </span>
                                        <div>
                                            <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                                {item.question}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {item.category || `Phase ${idx + 1}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
                                        {isAnswered ? (
                                            <>
                                                {evalItem?.scoreBand && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                        (evalItem.questionScore ?? 0) >= 7
                                                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                                            : (evalItem.questionScore ?? 0) >= 4
                                                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                                            : "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                                                    }`}>
                                                        {evalItem.scoreBand}
                                                    </span>
                                                )}
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                                                    Score: {evalItem?.questionScore ?? 0}/10
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                                Not answered (0/10)
                                            </span>
                                        )}
                                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900 text-xs border-t border-slate-200/60 dark:border-slate-800/60">
                                        {/* Candidate Transcript Evidence */}
                                        <div className={`p-3 rounded-xl border space-y-1 ${
                                            isAnswered
                                                ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200/50"
                                                : "bg-slate-50 dark:bg-slate-950/60 border-slate-200/60"
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px]">
                                                    Candidate Transcript Response
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    {isAnswered ? `${evalItem?.wordCount || 0} words` : "Unanswered"}
                                                </span>
                                            </div>
                                            <p className="text-slate-800 dark:text-slate-200 italic">
                                                {isAnswered ? `"${evalItem?.userAnswer || evalItem?.evidenceQuote}"` : "No answer provided for this question."}
                                            </p>
                                        </div>

                                        {/* Individual Question Rubric Breakdown if answered */}
                                        {isAnswered && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/60 text-[11px]">
                                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-0.5">
                                                    <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Technical (0–4 pts)</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{evalItem?.technicalScore ?? 0}</strong>
                                                        <span className="text-[10px] text-slate-400">/ 4</span>
                                                    </div>
                                                </div>
                                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-0.5">
                                                    <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Relevance (0–2 pts)</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{evalItem?.relevanceScore ?? 0}</strong>
                                                        <span className="text-[10px] text-slate-400">/ 2</span>
                                                    </div>
                                                </div>
                                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-0.5">
                                                    <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Completeness (0–2 pts)</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <strong className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">{evalItem?.completenessScore ?? 0}</strong>
                                                        <span className="text-[10px] text-slate-400">/ 2</span>
                                                    </div>
                                                </div>
                                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-0.5">
                                                    <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">Clarity (0–2 pts)</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <strong className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">{evalItem?.clarityScore ?? evalItem?.communicationScore ?? 0}</strong>
                                                        <span className="text-[10px] text-slate-400">/ 2</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Strengths & Missing Concepts */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-wider">
                                                    Strengths Demonstrated
                                                </span>
                                                <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                                                    {evalItem?.doneWell && evalItem.doneWell.length > 0 ? (
                                                        evalItem.doneWell.map((dw: string, dIdx: number) => (
                                                            <li key={dIdx} className="flex items-start gap-1.5">
                                                                <span className="text-emerald-500 shrink-0">✓</span>
                                                                <span>{dw}</span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-slate-400 italic">No specific strengths demonstrated for this question.</li>
                                                    )}
                                                </ul>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] tracking-wider">
                                                    Missing Concepts & Weaknesses
                                                </span>
                                                <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                                                    {evalItem?.missingConcepts && evalItem.missingConcepts.length > 0 ? (
                                                        evalItem.missingConcepts.map((mc: string, mIdx: number) => (
                                                            <li key={mIdx} className="flex items-start gap-1.5">
                                                                <span className="text-amber-500 shrink-0">•</span>
                                                                <span>{mc}</span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-slate-400 italic">None noted.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

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
                                                    onClick={() => copyText(evalItem?.betterStarAnswer || "SITUATION: Working on technical requirements.\nTASK: Implement clean solution.\nACTION: Applied patterns and tests.\nRESULT: High performance.", idx)}
                                                    className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    {copiedIndex === idx ? <><CopyCheck className="w-3 h-3 text-emerald-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Answer</>}
                                                </button>
                                            </div>
                                            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                                                {evalItem?.betterStarAnswer || "SITUATION: Working on technical requirements.\nTASK: Implement clean solution.\nACTION: Applied patterns and tests.\nRESULT: High performance."}
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
