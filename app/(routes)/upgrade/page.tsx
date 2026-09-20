import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Sparkles, Zap } from 'lucide-react'

export default function UpgradePage() {
    return (
        <div className="max-w-6xl mx-auto py-12 px-4 md:px-8 space-y-10 min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full border border-indigo-200/60 dark:border-indigo-800/60 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> MAPD Pricing Plans
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Upgrade Your Interview Preparation
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Unlock unlimited AI mock interviews, detailed scoring breakdowns, and custom resume-based interview generation.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
                {/* Free Plan */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Starter</h3>
                            <p className="text-xs text-slate-500">Perfect for candidates exploring AI mock practice.</p>
                        </div>

                        <div className="flex items-baseline gap-1 pt-2">
                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                            <span className="text-xs text-slate-400 font-semibold">/ month</span>
                        </div>

                        <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 pt-2">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>3 AI Mock Interviews per month</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Standard Role & Job Description parsing</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Voice & Text Interactive Interviewer</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Basic AI Performance Report</span>
                            </li>
                        </ul>
                    </div>

                    <Button variant="outline" className="w-full rounded-full font-semibold text-xs py-5">
                        Current Active Plan
                    </Button>
                </div>

                {/* Pro Plan */}
                <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500/50 rounded-3xl p-8 shadow-2xl flex flex-col justify-between space-y-6 overflow-hidden">
                    <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        Popular Choice
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" /> Pro Unlimited
                            </h3>
                            <p className="text-xs text-slate-300">For serious job seekers aiming for top tech offers.</p>
                        </div>

                        <div className="flex items-baseline gap-1 pt-2">
                            <span className="text-4xl font-extrabold">$19</span>
                            <span className="text-xs text-indigo-200 font-semibold">/ month</span>
                        </div>

                        <ul className="space-y-3 text-xs text-slate-200 pt-2">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Unlimited AI Mock Interviews</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>PDF Resume Parsing & Project Extraction</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Detailed Question-by-Question AI Feedback</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Exportable Performance Analytics</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2 text-center">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-xs py-5 shadow-lg shadow-indigo-500/30 cursor-not-allowed">
                            Upgrade to Pro (Coming Soon)
                        </Button>
                        <span className="text-[10px] text-slate-400 block">Stripe payment integration coming in next release.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}