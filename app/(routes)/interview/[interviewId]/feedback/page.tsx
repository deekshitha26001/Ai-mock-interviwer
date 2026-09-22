"use client"
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { ArrowLeft, Award, CheckCircle2, RotateCcw, Sparkles, Star, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, UserCheck, MessageSquare, Mic, FileText, Check, Printer, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RadarChart from './_components/RadarChart';

export default function InterviewFeedbackPage() {
    const { interviewId } = useParams();
    const router = useRouter();
    const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    // Fetch interview record from Convex
    const record = useQuery(
        api.Interview.GetInterviewQuestions,
        interviewId ? { interviewRecordId: interviewId as any } : "skip"
    );

    const feedbackData = record?.feedback || {
        feedback: "Great job completing your mock interview session! You demonstrated solid fundamental technical concepts and good communication.",
        rating: 8,
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

    const rating = feedbackData.rating || 8;
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

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                        <Printer className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Export PDF Report
                    </Button>
                    <Link href={`/interview/${interviewId}/recruiter-report`}>
                        <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold border-indigo-200 text-indigo-600 dark:text-indigo-400">
                            <UserCheck className="w-4 h-4 mr-1" /> View Recruiter Report
                        </Button>
                    </Link>
                    <Link href={`/interview/${interviewId}`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold shadow-md">
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Practice Again
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Top Rating Banner & 5-Metric Radar Chart */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Overall Practice Score Card */}
                <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Overall Practice Score</span>
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
                    <Badge className="bg-white/20 text-white border-0 text-[10px] w-fit font-semibold">
                        MAPD Evaluated
                    </Badge>
                </div>

                {/* 5-Metric Breakdown & Radar Chart */}
                <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Multi-Dimensional Skill Evaluation</span>
                        <span className="text-indigo-600 dark:text-indigo-400">Interactive Radar Chart & Metrics</span>
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Radar Chart */}
                        <div className="lg:col-span-5 flex justify-center py-2">
                            <RadarChart metrics={metrics} size={250} />
                        </div>

                        {/* Metric Bars */}
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

            {/* Speech Analysis & Key Feedback Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Speech Analysis Widget */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <Mic className="w-4 h-4 text-indigo-500" />
                        Speech & Filler Words Analysis
                    </h3>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border text-xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Filler Words Detected:</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                                {feedbackData.fillerWordsCount || 0} words ("um", "like", "uh")
                            </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pt-1">
                            {feedbackData.speechClarity || "Clear communication with structured response flow."}
                        </p>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        Executive Assessment
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feedbackData.feedback}
                    </p>
                </div>

                {/* Learning Recommendations */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Learning Recommendations
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

            {/* Question by Question Accordion Breakdown with STAR Answers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Question Breakdown & STAR Format Model Answers ({questionsList.length})
                </h3>

                <div className="space-y-3 pt-2">
                    {questionsList.map((item: any, idx: number) => {
                        const isOpen = openQuestionIndex === idx;
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
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Suggested STAR Model Answer Structure
                                            </span>
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
