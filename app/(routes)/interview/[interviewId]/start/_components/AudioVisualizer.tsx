"use client"
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    isListening: boolean;
    stream?: MediaStream | null;
}

export default function AudioVisualizer({ isListening, stream }: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isListening) {
            if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        let audioCtx: AudioContext | null = null;
        let analyser: AnalyserNode | null = null;
        let source: MediaStreamAudioSourceNode | null = null;

        const startVisualization = async () => {
            try {
                const mediaStream = stream || await navigator.mediaDevices.getUserMedia({ audio: true });
                audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 64;
                source = audioCtx.createMediaStreamSource(mediaStream);
                source.connect(analyser);

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const draw = () => {
                    animIdRef.current = requestAnimationFrame(draw);
                    analyser!.getByteFrequencyData(dataArray);

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const barWidth = (canvas.width / bufferLength) * 1.8;
                    let x = 0;

                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight = (dataArray[i] / 255) * canvas.height;
                        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                        gradient.addColorStop(0, '#6366f1'); // Indigo
                        gradient.addColorStop(1, '#ec4899'); // Pink

                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        if (ctx.roundRect) {
                            ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 4);
                        } else {
                            ctx.rect(x, canvas.height - barHeight, barWidth - 2, barHeight);
                        }
                        ctx.fill();

                        x += barWidth + 2;
                    }
                };
                draw();
            } catch (e) {
                console.warn("Visualizer audio setup notice:", e);
            }
        };

        startVisualization();

        return () => {
            if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
            if (audioCtx && audioCtx.state !== 'closed') {
                audioCtx.close();
            }
        };
    }, [isListening, stream]);

    if (!isListening) return null;

    return (
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider shrink-0">Live Mic</span>
            <canvas ref={canvasRef} width={120} height={24} className="h-6 w-28" />
        </div>
    );
}
