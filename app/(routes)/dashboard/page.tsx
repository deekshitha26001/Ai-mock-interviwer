"use client"
import { useUser } from '@clerk/nextjs'
import React, { useContext, useEffect, useState } from 'react'
import CreateInterviewDialog from '../_components/CreateInterviewDialog';
import { useConvex } from 'convex/react';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { InterviewData } from '../interview/[interviewId]/start/page';
import EmptyState from './_components/EmptyState';
import InterviewCard from './_components/InterviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, CheckCircle2, Clock, Layers, Sparkles } from 'lucide-react';

export default function Dashboard() {
    const { user } = useUser();
    const [interviewList, setInterviewList] = useState<InterviewData[]>([]);
    const { userDetail } = useContext(UserDetailContext);
    const [loading, setLoading] = useState(true);
    const convex = useConvex();

    useEffect(() => {
        if (userDetail?._id) {
            GetInterviewList();
        } else {
            setLoading(false);
        }
    }, [userDetail]);

    const GetInterviewList = async () => {
        if (!userDetail?._id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const result = await convex.query(api.Interview.GetInterviewList, {
                uid: userDetail?._id
            });
            console.log("Interview list fetched:", result);
            //@ts-ignore
            setInterviewList(result || []);
        } catch (err) {
            console.warn("Failed to fetch interview list:", err);
            setInterviewList([]);
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic stats
    const totalInterviews = interviewList.length;
    const completedInterviews = interviewList.filter(i => i.status === 'complete').length;

    const ratedInterviews = interviewList.filter(i => i.feedback?.rating !== undefined);
    const avgScore = ratedInterviews.length > 0
        ? (ratedInterviews.reduce((acc, curr) => acc + (curr.feedback?.rating || 0), 0) / ratedInterviews.length).toFixed(1)
        : "N/A";

    const totalHours = (totalInterviews * 0.5).toFixed(1);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[calc(100vh-80px)]">
            {/* Header / Welcome Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-1 z-10">
                    <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Candidate Dashboard
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        Welcome back, {user?.firstName || user?.fullName || 'Candidate'}!
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 font-medium pt-0.5">
                        Practice smarter. Interview better. Get hired.
                    </p>
                </div>
                <div className="z-10">
                    <CreateInterviewDialog />
                </div>
            </div>

            {/* Metrics & Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sessions</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalInterviews}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{completedInterviews}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Score</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{avgScore} {avgScore !== "N/A" && "/ 10"}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Practice Hours</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalHours} hrs</h3>
                    </div>
                </div>
            </div>

            {/* Sessions Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" /> Recent Mock Interviews
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                        Showing {interviewList.length} interview sessions
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map((_, index) => (
                            <div className="flex flex-col space-y-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border" key={index}>
                                <Skeleton className="h-[120px] w-full rounded-xl" />
                                <Skeleton className="h-4 w-[220px]" />
                                <Skeleton className="h-4 w-[160px]" />
                            </div>
                        ))}
                    </div>
                ) : interviewList.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {interviewList.map((interview, index) => (
                            <InterviewCard
                                interviewInfo={interview}
                                key={interview._id || index}
                                onDeleteSuccess={GetInterviewList}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}