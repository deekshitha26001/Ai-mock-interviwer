"use client"
import React, { useEffect, useState } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionTimerProps {
    keyIndex: number;
    initialSeconds?: number;
    onTimeUp?: () => void;
}

export default function QuestionTimer({ keyIndex, initialSeconds = 120, onTimeUp }: QuestionTimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);

    // Reset timer when active question index changes
    useEffect(() => {
        setTimeLeft(initialSeconds);
        setIsRunning(false);
    }, [keyIndex, initialSeconds]);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        if (onTimeUp) onTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning, timeLeft, onTimeUp]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const progressPercent = Math.max(0, Math.min(100, (timeLeft / initialSeconds) * 100));
    const isWarning = timeLeft <= 30;

    return (
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xs text-xs">
            <Clock className={`w-3.5 h-3.5 ${isWarning ? "text-rose-500 animate-bounce" : "text-indigo-500"}`} />
            <span className={`font-mono font-bold ${isWarning ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"}`}>
                {formatTime(timeLeft)}
            </span>

            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                <div
                    className={`h-full transition-all duration-300 ${isWarning ? "bg-rose-500" : "bg-indigo-600"}`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsRunning(!isRunning)}
                className="h-6 w-6 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title={isRunning ? "Pause timer" : "Start 2-min timer"}
            >
                {isRunning ? <Pause className="w-3 h-3 text-amber-500" /> : <Play className="w-3 h-3 text-emerald-500" />}
            </Button>

            <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                    setTimeLeft(initialSeconds);
                    setIsRunning(false);
                }}
                className="h-6 w-6 text-slate-400 hover:text-slate-700"
                title="Reset timer"
            >
                <RotateCcw className="w-3 h-3" />
            </Button>
        </div>
    );
}
