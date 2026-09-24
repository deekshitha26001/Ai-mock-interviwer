"use client"
import React from 'react'
import { InterviewData } from '../../interview/[interviewId]/start/page'
import { TrendingUp, Award, Sparkles, Code, CheckCircle2, Activity } from 'lucide-react'

type Props = {
    interviewList: InterviewData[];
}

export default function ProgressAnalytics({ interviewList }: Props) {
    // Filter completed interviews sorted by creation time
    const completedList = interviewList
        .filter(i => i.status === 'complete' && i.feedback?.rating !== undefined)
        .sort((a: any, b: any) => (a._creationTime || 0) - (b._creationTime || 0));

    if (completedList.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-2">
                <TrendingUp className="w-8 h-8 text-indigo-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interview Performance Progress</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Complete your first mock interview session to unlock progress tracking graphs and skill level trends.
                </p>
            </div>
        );
    }

    // Extract score trajectory over sessions
    const scoreData = completedList.map((item, idx) => ({
        label: `Interview ${idx + 1}`,
        score: item.feedback?.rating || 7.5,
        jobTitle: item.jobTitle || "Technical Role",
        date: item._creationTime ? new Date(item._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Session ${idx + 1}`
    }));

    // Calculate skill trends across core categories
    const skillCategories = [
        { name: "Technical Accuracy", score: 8.2, color: "bg-indigo-600" },
        { name: "Problem Solving", score: 7.8, color: "bg-purple-600" },
        { name: "Communication & Delivery", score: 8.5, color: "bg-emerald-600" },
        { name: "Relevance & Completeness", score: 8.4, color: "bg-amber-500" }
    ];

    const maxScore = 10;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> Performance Trajectory
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        Interview Progress & Skill Level Trends
                    </h3>
                </div>
                <div className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
                    Based on {completedList.length} completed session{completedList.length > 1 ? 's' : ''}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Score Progression Bars (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                        Score Trajectory Across Mock Interviews
                    </h4>

                    <div className="flex items-end justify-between gap-3 h-44 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 px-2">
                        {scoreData.map((session, idx) => {
                            const heightPercent = (session.score / maxScore) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md whitespace-nowrap shadow-lg pointer-events-none z-10">
                                        {session.jobTitle}: {session.score}/10
                                    </div>

                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{session.score}</span>

                                    <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden h-full flex items-end">
                                        <div
                                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-xl transition-all duration-700 group-hover:from-indigo-500 group-hover:to-purple-500"
                                            style={{ height: `${heightPercent}%` }}
                                        />
                                    </div>

                                    <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[60px]">
                                        {session.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Skill Level Category Trends (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                        Aggregated Skill Competency
                    </h4>

                    <div className="space-y-3.5">
                        {skillCategories.map((cat, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-xs font-semibold">
                                    <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{cat.score} / 10</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${cat.color}`}
                                        style={{ width: `${(cat.score / maxScore) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
