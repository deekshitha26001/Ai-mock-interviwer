"use client"
import React from 'react'
import { motion } from "motion/react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

function Hero() {
    return (
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
            <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
            </div>
            <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            </div>

            <div className="px-4 py-10 md:py-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
                    <Sparkles className="w-4 h-4" /> MAPD AI Interview Platform
                </div>

                <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-extrabold text-slate-900 md:text-5xl lg:text-7xl dark:text-white tracking-tight">
                    {"Practice Smarter. Interview Better. Get Hired."
                        .split(" ")
                        .map((word, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.08,
                                    ease: "easeInOut",
                                }}
                                className={`mr-2 inline-block ${index >= 4 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent' : ''}`}
                            >
                                {word}
                            </motion.span>
                        ))}
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="relative z-10 mx-auto max-w-2xl py-4 text-center text-sm md:text-base font-normal text-slate-600 dark:text-slate-400 leading-relaxed"
                >
                    Prepare for your dream role with MAPD interactive AI recruiter sessions. Tailored technical questions, voice & video interaction, and instant scoring breakdowns.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-4"
                >
                    <Link href={'/dashboard'}>
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg shadow-indigo-500/25 px-8 text-sm">
                            Start Practice <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link href={'/how-it-works'}>
                        <Button size="lg" variant="outline" className="rounded-full text-sm font-semibold">
                            How It Works
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1 }}
                    className="relative z-10 mt-16 rounded-3xl border border-neutral-200 bg-neutral-100 p-3 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div className="w-full overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700">
                        <img
                            src="/hero-2.png"
                            alt="MAPD AI Interview platform preview"
                            className="aspect-[16/9] h-auto w-full object-cover"
                            height={1000}
                            width={1000}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Hero