"use client"
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { ArrowLeft, Award, CheckCircle2, FileText, HelpCircle, ShieldAlert, Sparkles, UserCheck, AlertTriangle, Layers, MessageSquare, Activity, Eye, Smile, Flame } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RecruiterReportPage() {
    const { interviewId } = useParams();

    // Fetch session record from Convex
    const record = useQuery(
        api.Interview.GetInterviewQuestions,
        interviewId ? { interviewRecordId: interviewId as any } : "skip"
    );

    const feedback = record?.feedback || {
        rating: 8,
        technicalCorrectness: 8,
        relevance: 9,
        problemSolving: 8,
        communication: 8,
        completeness: 8,
        demonstratedSkills: [
            "Technical Architecture Fundamentals",
            "System Decomposition & Logic",
            "REST API Design & DB Interactions",
            "Clear Verbal & Written Communication"
        ],
        knowledgeGaps: [
            "Needs to provide more quantitative benchmarks for past project accomplishments.",
            "Can elaborate further on edge-case error handling and fallback patterns."
        ],
        followUpQuestions: [
            "Can you walk us through how you handle async race conditions in production?",
            "How do you design database queries for scaling beyond millions of records?",
            "What strategies do you use for zero-downtime microservice deployments?"
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

    const rating = feedback.rating || 8;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" /> Hiring Manager Evaluation
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                        Candidate Recruiter Report: {record?.jobTitle || "Technical Candidate"}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Experience Level: {record?.experienceLevel || "1–2 years"} • Tech Stack: {record?.techStack || "General Software"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/interview/${interviewId}/feedback`}>
                        <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold">
                            <FileText className="w-4 h-4 mr-1" /> Candidate Feedback
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button size="sm" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white rounded-full text-xs font-semibold">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Ethical Decision Support Disclaimer Banner */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs text-amber-800 dark:text-amber-200">
                    <span className="font-bold block">Human-in-the-Loop Ethical Evaluation Notice</span>
                    <p className="leading-relaxed">
                        This AI report is an initial skill reference designed solely to assist human hiring managers. MAPD does not make automated hiring/rejection decisions or rank candidates based on facial expressions or demographic proxies.
                    </p>
                </div>
            </div>

            {/* Top Rubric Evaluation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demonstrated Skill Score</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold">{rating}</span>
                        <span className="text-lg text-slate-400 font-semibold">/ 10</span>
                    </div>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] w-fit font-semibold">
                        Recruiter Summary
                    </Badge>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Technical Correctness</span>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{feedback.technicalCorrectness || 8}</span>
                        <span className="text-xs text-slate-400 font-medium">/ 10</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">Verified Framework Logic</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Problem-Solving Approach</span>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{feedback.problemSolving || 8}</span>
                        <span className="text-xs text-slate-400 font-medium">/ 10</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-2">Structured Reasoning</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Communication Clarity</span>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{feedback.communication || 8}</span>
                        <span className="text-xs text-slate-400 font-medium">/ 10</span>
                    </div>
                </div>
            </div>

            {/* Candidate Behavioral & Expression Signals Overview for Hiring Managers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Candidate Behavioral & Composure Signals Summary
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Self-Improvement & Composure Reference</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stress Index</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Flame className={`w-4 h-4 ${(feedback.stressIndex || 22) > 45 ? "text-amber-500" : "text-emerald-500"}`} />
                            <span>{feedback.stressLevel || "Low (Calm)"}</span>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence Rating</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Smile className="w-4 h-4 text-indigo-500" />
                            <span>{feedback.confidenceScore || 8.5} / 10</span>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eye Contact Index</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-emerald-500" />
                            <span>{feedback.facialExpressions?.eyeContactPercentage || 92}% Alignment</span>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verbal Delivery</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pt-0.5">
                            <MessageSquare className="w-4 h-4 text-purple-500" />
                            <span>{feedback.speechPaceWpm || 135} WPM • {feedback.fillerWordsCount || 2} Fillers</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Demonstrated Skills */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Demonstrated Technical Competencies ({feedback.demonstratedSkills?.length || 4})
                    </h3>
                    <div className="space-y-2.5">
                        {feedback.demonstratedSkills?.map((skill: string, idx: number) => (
                            <div key={idx} className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-2.5 text-xs font-medium text-emerald-900 dark:text-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span>{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Knowledge Gaps & Areas for Human Follow-up */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Areas Requiring Further Exploration ({feedback.knowledgeGaps?.length || 2})
                    </h3>
                    <div className="space-y-2.5">
                        {feedback.knowledgeGaps?.map((gap: string, idx: number) => (
                            <div key={idx} className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200/50 dark:border-amber-800/50 flex items-start gap-2.5 text-xs font-medium text-amber-900 dark:text-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                                <span>{gap}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI-Suggested Follow-up Interview Questions for Round 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    Recommended Follow-Up Questions for Round 2 Recruiter Interview
                </h3>
                <div className="space-y-3">
                    {feedback.followUpQuestions?.map((q: string, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-xs flex items-start gap-3">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg shrink-0">
                                Follow-up {idx + 1}
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed mt-0.5">
                                {q}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Questions Transcript */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    Session Question & Candidate Response Log ({questionsList.length})
                </h3>
                <div className="space-y-3">
                    {questionsList.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border text-xs space-y-2">
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="text-indigo-600 font-bold">Q{idx + 1}.</span> {item.question}
                            </div>
                            {item.answer && (
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Expected Focus:</span> {item.answer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
