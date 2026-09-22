"use client"
import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function SavedFlashcards() {
    const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const loadSavedQuestions = () => {
        try {
            const savedStr = localStorage.getItem("mapd_saved_flashcards") || "[]";
            const parsed = JSON.parse(savedStr);
            setSavedQuestions(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
            setSavedQuestions([]);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadSavedQuestions();
        }
    }, [isOpen]);

    const removeQuestion = (qText: string) => {
        const updated = savedQuestions.filter(q => q.question !== qText);
        setSavedQuestions(updated);
        try {
            localStorage.setItem("mapd_saved_flashcards", JSON.stringify(updated));
        } catch (e) {}
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold border-amber-200 text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/40">
                    <Bookmark className="w-3.5 h-3.5 mr-1.5 text-amber-500 fill-amber-400" /> Saved Flashcards ({savedQuestions.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-400" />
                            Bookmarked Practice Flashcards ({savedQuestions.length})
                        </span>
                    </DialogTitle>
                </DialogHeader>

                {savedQuestions.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Saved Flashcards Yet</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Click the <strong>Bookmark</strong> button during any mock interview question to save tricky questions here for quick revision!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        {savedQuestions.map((item, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 relative group">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md">
                                        {item.jobTitle || "Technical Role"}
                                    </span>
                                    <button
                                        onClick={() => removeQuestion(item.question)}
                                        className="text-slate-400 hover:text-rose-500 transition p-1"
                                        title="Remove question"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                    {item.question}
                                </h4>
                                {item.answer && (
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border text-[11px] text-slate-600 dark:text-slate-300">
                                        <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Focus Concepts</span>
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
