"use client"
import React, { useEffect, useState } from 'react';
import { Settings2, Volume2, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface VoiceSettingsProps {
    speechRate: number;
    setSpeechRate: (rate: number) => void;
    selectedVoiceName: string;
    setSelectedVoiceName: (voice: string) => void;
}

export default function VoiceSettings({
    speechRate,
    setSpeechRate,
    selectedVoiceName,
    setSelectedVoiceName
}: VoiceSettingsProps) {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const updateVoices = () => {
                const available = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
                setVoices(available);
            };

            updateVoices();
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl font-medium border-slate-200 dark:border-slate-800">
                    <Sliders className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Voice Controls
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-indigo-500" />
                        AI Voice & Speech Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2 text-xs">
                    {/* Voice Selection */}
                    <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                            Preferred AI Accent / Voice
                        </label>
                        <select
                            value={selectedVoiceName}
                            onChange={(e) => setSelectedVoiceName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Default AI Voice</option>
                            {voices.map((v, i) => (
                                <option key={i} value={v.name}>
                                    {v.name} ({v.lang})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Speech Speed Rate */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center font-semibold text-slate-700 dark:text-slate-300">
                            <span>Speech Speed Rate</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{speechRate}x</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            {[0.8, 0.95, 1.0, 1.15, 1.25].map((rate) => (
                                <button
                                    key={rate}
                                    onClick={() => setSpeechRate(rate)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                                        speechRate === rate
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                                    }`}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
