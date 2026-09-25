"use client"
import React, { useEffect, useState } from 'react';
import { Volume2, Sliders, PlayCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getGenderVoice, isVoiceMatchingGender, getInterviewerConfig } from '@/utils/interviewerConfig';

interface VoiceSettingsProps {
    speechRate: number;
    setSpeechRate: (rate: number) => void;
    selectedVoiceName: string;
    setSelectedVoiceName: (voice: string) => void;
    interviewerGender?: 'male' | 'female';
}

export default function VoiceSettings({
    speechRate,
    setSpeechRate,
    selectedVoiceName,
    setSelectedVoiceName,
    interviewerGender = 'female'
}: VoiceSettingsProps) {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    const interviewer = getInterviewerConfig(interviewerGender);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const updateVoices = () => {
                const available = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en') || !v.lang);
                setVoices(available);
            };

            updateVoices();
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, []);

    const femaleVoices = voices.filter(v => isVoiceMatchingGender(v.name, 'female'));
    const maleVoices = voices.filter(v => isVoiceMatchingGender(v.name, 'male'));
    const otherVoices = voices.filter(v => !isVoiceMatchingGender(v.name, 'female') && !isVoiceMatchingGender(v.name, 'male'));

    const handlePreviewVoice = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        setIsPlayingPreview(true);

        const sampleText = interviewerGender === 'male'
            ? `Hello, I am ${interviewer.name}. I am your male AI technical interviewer, ready for your session.`
            : `Hello, I am ${interviewer.name}. I am your female AI engineering evaluator, ready for your session.`;

        const utterance = new SpeechSynthesisUtterance(sampleText);
        utterance.rate = speechRate || 1.0;
        utterance.pitch = interviewerGender === 'male' ? 0.9 : 1.1;

        let voiceObj = voices.find(v => v.name === selectedVoiceName);
        if (!voiceObj) {
            voiceObj = getGenderVoice(voices, interviewerGender) || voices[0];
        }

        if (voiceObj) {
            utterance.voice = voiceObj;
        }

        utterance.onend = () => setIsPlayingPreview(false);
        utterance.onerror = () => setIsPlayingPreview(false);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl font-medium border-slate-200 dark:border-slate-800">
                    <Sliders className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Voice Controls
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-indigo-500" />
                            AI Voice & Speech Settings
                        </span>
                        <span className="text-xs px-2.5 py-0.9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> {interviewer.badge}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 pt-2 text-xs">
                    {/* Active AI Interviewer Banner */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <img
                            src={interviewer.avatar}
                            alt={interviewer.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{interviewer.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                Assigned Voice Mode: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{interviewerGender === 'male' ? 'Male Voice' : 'Female Voice'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Voice Selection */}
                    <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                            Preferred Voice ({interviewerGender === 'female' ? 'Female Voice Recommended' : 'Male Voice Recommended'})
                        </label>
                        <select
                            value={selectedVoiceName}
                            onChange={(e) => setSelectedVoiceName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Auto Select Best {interviewerGender === 'male' ? 'Male' : 'Female'} Voice</option>
                            
                            {femaleVoices.length > 0 && (
                                <optgroup label="👩 Female AI Voices">
                                    {femaleVoices.map((v, i) => (
                                        <option key={`f-${i}`} value={v.name}>
                                            {v.name} ({v.lang})
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {maleVoices.length > 0 && (
                                <optgroup label="👨 Male AI Voices">
                                    {maleVoices.map((v, i) => (
                                        <option key={`m-${i}`} value={v.name}>
                                            {v.name} ({v.lang})
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {otherVoices.length > 0 && (
                                <optgroup label="🌐 All System Voices">
                                    {otherVoices.map((v, i) => (
                                        <option key={`o-${i}`} value={v.name}>
                                            {v.name} ({v.lang})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
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
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Test / Preview Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button
                            size="sm"
                            type="button"
                            onClick={handlePreviewVoice}
                            disabled={isPlayingPreview}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl px-4 h-9 cursor-pointer shadow-sm"
                        >
                            <PlayCircle className="w-4 h-4 mr-1.5" />
                            {isPlayingPreview ? "Testing Voice..." : `Test ${interviewerGender === 'male' ? 'Male' : 'Female'} Voice`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

