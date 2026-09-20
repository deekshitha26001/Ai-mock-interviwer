import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Code, Cpu, FileText, MessageSquare, Sparkles, Trophy, Video } from 'lucide-react'
import CreateInterviewDialog from '../_components/CreateInterviewDialog'

export default function HowItWorksPage() {
    const steps = [
        {
            num: "01",
            title: "Create Your Target Interview Role",
            desc: "Specify your target position, years of experience, tech stack, or upload your PDF resume to extract projects.",
            icon: FileText
        },
        {
            num: "02",
            title: "AI Question Generation",
            desc: "MAPD AI analyzes your profile and generates role-specific technical and behavioral questions.",
            icon: Cpu
        },
        {
            num: "03",
            title: "Interactive Voice & Video Session",
            desc: "Test your camera & mic, listen to the recruiter's questions, and respond using voice or text input.",
            icon: Video
        },
        {
            num: "04",
            title: "Instant Performance Evaluation",
            desc: "Receive scores across technical knowledge, communication clarity, and problem-solving skills.",
            icon: Trophy
        },
        {
            num: "05",
            title: "Detailed Question-by-Question Insights",
            desc: "Review model answers, key focus concepts, and suggested areas of improvement to refine your interview skills.",
            icon: Sparkles
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 md:px-8 space-y-12 min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full border border-indigo-200/60 dark:border-indigo-800/60 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> How MAPD Works
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    5 Steps to Master Your Tech Interviews
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    A complete end-to-end workflow designed to build your confidence and help you land your dream tech job.
                </p>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-6 max-w-4xl mx-auto">
                {steps.map((step, idx) => {
                    const IconComponent = step.icon;
                    return (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-indigo-300 transition">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-extrabold text-lg border border-indigo-100 dark:border-indigo-900">
                                    {step.num}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <IconComponent className="w-4 h-4 text-indigo-500" />
                                        {step.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 rounded-3xl text-center space-y-4 shadow-xl border border-slate-800 max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold">Ready to Start Your First AI Mock Interview?</h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Join thousands of developers using MAPD to practice technical questions and boost interview scores.
                </p>
                <div className="pt-2 flex justify-center">
                    <CreateInterviewDialog />
                </div>
            </div>
        </div>
    );
}
