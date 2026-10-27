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

    if (record === undefined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                <Sparkles className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs text-slate-500 font-semibold">Loading recruiter evaluation...</p>
            </div>
        );
    }

    if (!record || !record.feedback) {
        return (
            <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recruiter Evaluation Unavailable</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                    This interview session does not have an evaluated recruiter report yet.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                    <Link href={`/interview/${interviewId}/start`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold cursor-pointer">
                            Resume Interview
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

    const feedback = record.feedback;
    const isIncomplete = record?.status === 'incomplete' || feedback.isComplete === false;

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

    const answeredCount = feedback.answeredCount ?? (record?.candidateAnswers?.length || 0);
    const totalQuestionsCount = questionsList.length || feedback.totalQuestions || 8;
    const rating = typeof feedback.rating === 'number' ? feedback.rating : 0;

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
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4" /> Hiring Manager Evaluation
                        </span>
                    )}
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

            {/* Incomplete Interview Notice if applicable */}
            {isIncomplete && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs text-amber-800 dark:text-amber-200">
                        <span className="font-bold block">Incomplete Interview Notice</span>
                        <p className="leading-relaxed">
                            Candidate ended this interview early after answering {answeredCount} of {totalQuestionsCount} questions. Unanswered questions received 0 points. Evaluated metrics represent responses provided.
                        </p>
                    </div>
                </div>
            )}

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
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demonstrated Skill Score</span>
                        {isIncomplete && (
                            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                                Incomplete
                            </span>
                        )}
                    </div>
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
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{feedback.technicalCorrectness ?? 0}</span>
                        <span className="text-xs text-slate-400 font-medium">/ 10</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">Verified Framework Logic</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Problem-Solving Approach</span>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{feedback.problemSolving ?? 0}</span>
                        <span className="text-xs text-slate-400 font-medium">/ 10</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-2">Structured Reasoning</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Communication Clarity</span>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{feedback.communication ?? 0}</span>
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
                            <Flame className={`w-4 h-4 ${(typeof feedback.stressIndex === 'number' ? feedback.stressIndex : 20) > 45 ? "text-amber-500" : "text-emerald-500"}`} />
                            <span>{feedback.stressLevel || "Low (Calm)"}</span>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence Rating</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Smile className="w-4 h-4 text-indigo-500" />
                            <span>{typeof feedback.confidenceScore === 'number' ? feedback.confidenceScore : 0} / 10</span>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eye Contact Index</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-emerald-500" />
                            <span>{typeof feedback.facialExpressions?.eyeContactPercentage === 'number' ? feedback.facialExpressions.eyeContactPercentage : 0}% Alignment</span>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verbal Delivery</span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pt-0.5">
                            <MessageSquare className="w-4 h-4 text-purple-500" />
                            <span>{typeof feedback.speechPaceWpm === 'number' ? feedback.speechPaceWpm : 0} WPM • {typeof feedback.fillerWordsCount === 'number' ? feedback.fillerWordsCount : 0} Fillers</span>
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
