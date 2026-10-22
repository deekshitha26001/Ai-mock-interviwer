"use client"
import React, { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Code, Search, Sparkles, Star, ArrowRight, Briefcase, CheckCircle2, Layers, Cpu, Server, Terminal, Shield, Database } from 'lucide-react'
import CreateInterviewDialog from '../_components/CreateInterviewDialog'
import { generateRoleAwareQuestions, QuestionItem } from '@/lib/roleInterviewerEngine'

interface PresetRole {
    id: string;
    title: string;
    shortTitle: string;
    icon: string;
    techStack: string;
    description: string;
    experience: string;
}

const PRESET_ROLES: PresetRole[] = [
    {
        id: "java_dev",
        title: "Senior Java Developer",
        shortTitle: "Java Developer",
        icon: "☕",
        techStack: "Java 21, Spring Boot, Microservices, SQL, Docker",
        description: "Design and implement scalable backend microservices, lead concurrency and JVM tuning, and manage database persistence.",
        experience: "3+ years (Senior)"
    },
    {
        id: "fullstack_dev",
        title: "Full Stack Developer",
        shortTitle: "Full Stack Engineer",
        icon: "⚛️",
        techStack: "React 19, Next.js, Node.js, TypeScript, PostgreSQL",
        description: "Build robust full-stack applications with responsive React client interfaces and resilient backend REST/GraphQL services.",
        experience: "2–3 years"
    },
    {
        id: "aiml_eng",
        title: "AI & Machine Learning Engineer",
        shortTitle: "AI / ML Engineer",
        icon: "🤖",
        techStack: "Python, PyTorch, Scikit-Learn, Transformers, FastAPI",
        description: "Develop, fine-tune, and deploy machine learning models, implement vector retrieval pipelines, and optimize inference latency.",
        experience: "3+ years (Senior)"
    },
    {
        id: "frontend_dev",
        title: "Frontend React Engineer",
        shortTitle: "Frontend Engineer",
        icon: "🎨",
        techStack: "React 19, TypeScript, Tailwind CSS, Next.js App Router",
        description: "Craft pixel-perfect, accessible, and high-performance user interfaces with modern client state management and streaming SSR.",
        experience: "1–2 years"
    },
    {
        id: "devops_eng",
        title: "DevOps & Cloud Engineer",
        shortTitle: "DevOps & Cloud",
        icon: "☁️",
        techStack: "Kubernetes, Docker, AWS, Terraform, GitHub Actions",
        description: "Architect CI/CD automation pipelines, maintain high-availability Kubernetes infrastructure, and implement cloud security controls.",
        experience: "3+ years (Senior)"
    },
    {
        id: "data_analyst",
        title: "Data Analyst & SQL Specialist",
        shortTitle: "Data Analyst",
        icon: "📊",
        techStack: "SQL, Python, PostgreSQL, Pandas, Power BI",
        description: "Analyze complex business datasets, construct optimized analytical queries, and generate actionable executive dashboards.",
        experience: "1–2 years"
    }
];

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
    const [viewMode, setViewMode] = useState<"role_generator" | "question_bank">("role_generator");
    const [selectedRole, setSelectedRole] = useState<PresetRole>(PRESET_ROLES[0]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Generate Role-Aware 8-Phase Questions dynamically
    const generatedRoleQuestions = useMemo(() => {
        return generateRoleAwareQuestions(
            selectedRole.title,
            selectedRole.description,
            selectedRole.techStack,
            selectedRole.experience
        );
    }, [selectedRole]);

    const filteredBankQuestions = QUESTION_BANK.filter(q => {
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
                        <BookOpen className="w-3.5 h-3.5" /> MAPD AI Question Generator & Bank
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                        Technical Interview Questions
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 font-medium">
                        Generate role-tailored 8-phase interview progression questions or explore the core question library.
                    </p>
                </div>
                <div>
                    <CreateInterviewDialog />
                </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                    <button
                        id="tabRoleGenerator"
                        onClick={() => setViewMode("role_generator")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            viewMode === "role_generator"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Questions by Selected Job Role
                    </button>
                    <button
                        id="tabQuestionBank"
                        onClick={() => setViewMode("question_bank")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            viewMode === "question_bank"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" /> Question Bank Library
                    </button>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Deterministic 8-Phase Progression Engine</span>
                </div>
            </div>

            {/* VIEW 1: Role-Aware Generated Questions */}
            {viewMode === "role_generator" && (
                <div className="space-y-6" id="selectedRoleQuestionsSection">
                    {/* Role Selector Pills */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Select Target Job Role:
                        </span>
                        <div className="flex items-center gap-2.5 overflow-x-auto pb-2" id="rolePillsContainer">
                            {PRESET_ROLES.map(role => (
                                <button
                                    key={role.id}
                                    id={`rolePill-${role.id}`}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                                        selectedRole.id === role.id
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                                    }`}
                                >
                                    <span>{role.icon}</span>
                                    <span>{role.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Selected Role Banner */}
                    <div id="selectedRoleHeaderCard" className="bg-white dark:bg-slate-900 border border-indigo-200/60 dark:border-indigo-900/40 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-indigo-600 text-white text-xs font-bold px-3 py-1">
                                    Target Role: {selectedRole.title}
                                </Badge>
                                <Badge variant="outline" className="text-xs border-indigo-300 text-indigo-700 dark:text-indigo-300 font-semibold">
                                    {selectedRole.experience}
                                </Badge>
                                <Badge variant="secondary" className="text-xs font-semibold">
                                    {generatedRoleQuestions.length} Questions Generated
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                                <strong>Core Tech Stack:</strong> {selectedRole.techStack}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-500 italic max-w-2xl">
                                {selectedRole.description}
                            </p>
                        </div>

                        <div className="shrink-0">
                            <CreateInterviewDialog />
                        </div>
                    </div>

                    {/* Generated Questions List (8 Phases) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="generatedQuestionsGrid">
                        {generatedRoleQuestions.map((q, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 hover:shadow-md transition"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                                                Phase {q.phase || idx + 1}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500">
                                                {q.category || "Technical Interview"}
                                            </span>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] font-bold uppercase tracking-wider ${
                                                q.difficulty === "hard" || q.difficulty === "scenario"
                                                    ? "text-rose-600 border-rose-300"
                                                    : q.difficulty === "medium"
                                                    ? "text-amber-600 border-amber-300"
                                                    : "text-emerald-600 border-emerald-300"
                                            }`}
                                        >
                                            {q.difficulty || "medium"}
                                        </Badge>
                                    </div>

                                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                                        {q.question}
                                    </h3>

                                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[10px] uppercase tracking-wider">
                                            Recruiter Benchmark Answer / Evaluation Focus
                                        </span>
                                        <p className="leading-relaxed">{q.answer}</p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Generated by MAPD Role Engine
                                    </span>
                                    <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer">
                                        Ready for Practice →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VIEW 2: Standard Question Bank Library */}
            {viewMode === "question_bank" && (
                <div className="space-y-6">
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
                        {filteredBankQuestions.map(q => (
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
            )}
        </div>
    );
}
