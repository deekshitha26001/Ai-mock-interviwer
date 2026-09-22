"use client"
import React from 'react';

interface MetricPoint {
    label: string;
    score: number; // 0 to 10
}

interface RadarChartProps {
    metrics: MetricPoint[];
    size?: number;
}

export default function RadarChart({ metrics, size = 260 }: RadarChartProps) {
    const center = size / 2;
    const radius = center - 40;
    const totalAxes = metrics.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    // Calculate (x, y) for a given value (0-10) and axis index
    const getCoordinates = (value: number, index: number) => {
        const angle = index * angleSlice - Math.PI / 2;
        const dist = (value / 10) * radius;
        return {
            x: center + dist * Math.cos(angle),
            y: center + dist * Math.sin(angle)
        };
    };

    // Build data polygon path string
    const dataPoints = metrics.map((m, i) => getCoordinates(m.score, i));
    const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    // Grid circles/polygons at 20%, 40%, 60%, 80%, 100%
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

    return (
        <div className="flex flex-col items-center justify-center relative">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Grid Lines */}
                {levels.map((level, levelIdx) => {
                    const gridPoints = metrics.map((_, i) => getCoordinates(level * 10, i));
                    const gridPath = gridPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
                    return (
                        <path
                            key={levelIdx}
                            d={gridPath}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray={levelIdx === levels.length - 1 ? "0" : "3 3"}
                            className="dark:stroke-slate-800"
                        />
                    );
                })}

                {/* Axes Lines */}
                {metrics.map((_, i) => {
                    const outer = getCoordinates(10, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={outer.x}
                            y2={outer.y}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                            className="dark:stroke-slate-800"
                        />
                    );
                })}

                {/* Radar Filled Data Shape */}
                <path
                    d={polygonPath}
                    fill="url(#radarGradient)"
                    fillOpacity="0.4"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    className="drop-shadow-sm"
                />

                {/* Data Points (Dots) */}
                {dataPoints.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#4f46e5"
                        stroke="#ffffff"
                        strokeWidth="2"
                    />
                ))}

                {/* Labels */}
                {metrics.map((m, i) => {
                    const outer = getCoordinates(11.5, i);
                    let textAnchor = "middle";
                    if (outer.x > center + 10) textAnchor = "start";
                    if (outer.x < center - 10) textAnchor = "end";

                    return (
                        <text
                            key={i}
                            x={outer.x}
                            y={outer.y + 4}
                            textAnchor={textAnchor}
                            className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300"
                        >
                            {m.label} ({m.score}/10)
                        </text>
                    );
                })}

                <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
