"use client"
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Code, Search, Sparkles, Star, ArrowRight } from 'lucide-react'
import CreateInterviewDialog from '../_components/CreateInterviewDialog'

const CATEGORIES = [
    "All",
    "Java",
    "Python",
    "JavaScript",
    "React",
    "Spring Boot",
    "SQL",
    "Data Structures",
    "Machine Learning",
    "Behavioral"
];

const QUESTION_BANK = [
    {
        id: 1,
        category: "Java",
        difficulty: "Intermediate",
        question: "How does Garbage Collection work in Java, and what are G1 and ZGC collectors?",
        concepts: "Memory Management, Heap Memory, Mark & Sweep, Generational GC",
        answer: "Java Garbage Collection automatically manages memory by reclaiming unused objects. G1 divides heap into regions for predictable pause times, while ZGC achieves sub-millisecond pauses for multi-terabyte heaps."
    },
    {
        id: 2,
        category: "React",
        difficulty: "Advanced",
        question: "Explain React 18 Concurrent Rendering, useTransition, and Server Components.",
        concepts: "Fiber Architecture, Non-blocking Rendering, Streaming SSR",
        answer: "Concurrent Rendering allows React to interrupt and resume rendering for high-priority updates. useTransition marks state updates as non-blocking transitions."
    },
    {
        id: 3,
        category: "Spring Boot",
        difficulty: "Intermediate",
        question: "How does Dependency Injection and IoC Container work in Spring Framework?",
        concepts: "IoC Container, @Autowired, Bean Lifecycle, ApplicationContext",
        answer: "The IoC Container manages object creation and dependency wiring via reflection and annotations, decoupling component instantiation from application logic."
    },
    {
        id: 4,
        category: "SQL",
        difficulty: "Intermediate",
        question: "What is the difference between WHERE and HAVING clauses, and how do SQL Indexes work?",
        concepts: "B-Tree Indexes, Query Execution, Grouping, Aggregate Functions",
        answer: "WHERE filters rows before aggregation occurs, while HAVING filters aggregated groups after GROUP BY. Indexes use B-Trees to accelerate row lookups."
    },
    {
        id: 5,
        category: "Data Structures",
        difficulty: "Hard",
        question: "Explain LRU Cache implementation using Doubly Linked List and Hash Map.",
        concepts: "O(1) Time Complexity, Doubly Linked List, Map Lookup, Eviction Policy",
        answer: "A Hash Map provides O(1) key-to-node lookups, while a Doubly Linked List maintains access order to evict the Least Recently Used item in O(1) time."
    },
    {
        id: 6,
        category: "Behavioral",
        difficulty: "General",
        question: "Describe a situation where you had a technical disagreement with a team member and how you resolved it.",
        concepts: "STAR Method, Empathy, Technical Trade-off Benchmarking, Resolution",
        answer: "Outline the specific architectural difference, demonstrate how data or benchmarks were used to objectively evaluate options, and highlight team consensus."
    }
];

export default function QuestionsPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredQuestions = QUESTION_BANK.filter(q => {
        const matchesCat = selectedCategory === "All" || q.category === selectedCategory;
        const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.concepts.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[calc(100vh-80px)]">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800">
                <div className="space-y-1">
                    <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> MAPD Question Library
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        Technical Interview Question Bank
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 font-medium">
                        Explore high-frequency interview questions across frameworks, languages, and behavioral topics.
                    </p>
                </div>
                <div>
                    <CreateInterviewDialog />
                </div>
            </div>

            {/* Filters Row */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search questions or key concepts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 text-xs rounded-full bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                selectedCategory === cat
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredQuestions.map(q => (
                    <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 border-indigo-200 dark:border-indigo-800">
                                    {q.category}
                                </Badge>
                                <span className="text-[11px] font-semibold text-slate-400">
                                    {q.difficulty}
                                </span>
                            </div>

                            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                                {q.question}
                            </h3>

                            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[10px] uppercase mb-0.5">
                                    Key Focus Areas
                                </span>
                                {q.concepts}
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-medium">Curated for mock practice</span>
                            <CreateInterviewDialog />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
