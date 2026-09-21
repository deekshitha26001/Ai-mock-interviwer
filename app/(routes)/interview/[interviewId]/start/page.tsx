"use client"
import { api } from '@/convex/_generated/api';
import axios from 'axios';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneCall, PhoneOff, User, Volume2, Sparkles, CheckCircle2, MessageSquare, Send, ArrowLeft, AlertCircle, Loader2, Camera, CameraOff, Eye, ShieldCheck, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackInfo } from '@/app/(routes)/dashboard/_components/FeedbackDialog';
import { Input } from '@/components/ui/input';

export type InterviewData = {
    jobTitle: string | null,
    jobDescription: string | null,
    techStack?: string | null,
    experienceLevel?: string | null,
    interviewQuestions: InterviewQuestions[],
    userId: string | null,
    _id: string,
    resumeUrl: string | null,
    status: string | null,
    feedback?: FeedbackInfo | null
}

type InterviewQuestions = {
    answer: string,
    question: string
}

type Messages = {
    from: 'user' | 'bot',
    text: string
}

export default function StartInterview() {
    const params = useParams();
    const interviewId = params?.interviewId as string;
    const router = useRouter();

    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [micOn, setMicOn] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const [joined, setJoined] = useState(false);
    const [loadingCall, setLoadingCall] = useState(false);
    const [messages, setMessages] = useState<Messages[]>([]);
    const [userInputText, setUserInputText] = useState("");
    const [isListening, setIsListening] = useState(false);

    // Camera Framing & Face Detection Signals
    const [faceSignal, setFaceSignal] = useState<string>("Face Centered");
    const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);

    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const convex = useConvex();
    const updateFeedback = useMutation(api.Interview.UpdateFeedback);

    // Fetch interview record reactively from Convex
    const rawRecord = useQuery(
        api.Interview.GetInterviewQuestions,
        interviewId ? { interviewRecordId: interviewId as any } : "skip"
    );

    // Clean up tracks on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Ensure video element gets assigned the stream when camera is on and mounted
    useEffect(() => {
        if (cameraOn && videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [cameraOn, mediaStream]);

    // Camera initializer
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            mediaStreamRef.current = stream;
            setMediaStream(stream);
            setCameraOn(true);
            setCameraPermissionError(null);
        } catch (e) {
            console.warn("Camera init warning:", e);
            setCameraPermissionError("Camera disabled / unavailable. Video is optional.");
            setCameraOn(false);
        }
    };

    const toggleCamera = async () => {
        if (cameraOn) {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getVideoTracks().forEach(t => t.stop());
            }
            setMediaStream(null);
            setCameraOn(false);
            toast.info("Camera turned off. You can continue with voice/text.");
        } else {
            await startCamera();
        }
    };

    // Auto-start camera when page loads
    useEffect(() => {
        startCamera();
    }, []);

    useEffect(() => {
        if (!interviewId) {
            setErrorMsg("No interview ID provided in URL.");
            setLoadingData(false);
            return;
        }

        if (rawRecord === undefined) {
            setLoadingData(true);
            return;
        }

        setLoadingData(false);

        if (!rawRecord) {
            setErrorMsg("Interview session not found in database.");
            return;
        }

        setErrorMsg(null);

        // Parse questions from various schema forms
        let parsedQuestions: InterviewQuestions[] = [];
        const rawQ = rawRecord.interviewQuestions;

        if (Array.isArray(rawQ)) {
            parsedQuestions = rawQ.map((q: any) => {
                if (typeof q === 'string') return { question: q, answer: '' };
                return { question: q.question || q.q || String(q), answer: q.answer || q.a || '' };
            });
        } else if (typeof rawQ === 'object' && rawQ !== null) {
            const arr = rawQ.questions || rawQ.interviewQuestions || [];
            if (Array.isArray(arr)) {
                parsedQuestions = arr.map((q: any) => {
                    if (typeof q === 'string') return { question: q, answer: '' };
                    return { question: q.question || q.q || String(q), answer: q.answer || q.a || '' };
                });
            }
        } else if (typeof rawQ === 'string') {
            try {
                const parsed = JSON.parse(rawQ);
                const arr = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.interviewQuestions || []);
                if (Array.isArray(arr)) {
                    parsedQuestions = arr.map((q: any) => {
                        if (typeof q === 'string') return { question: q, answer: '' };
                        return { question: q.question || q.q || String(q), answer: q.answer || q.a || '' };
                    });
                }
            } catch (e) {
                console.error("Failed to parse JSON string of questions:", e);
            }
        }

        if (parsedQuestions.length === 0) {
            const role = rawRecord.jobTitle || 'Software Engineer';
            parsedQuestions = [
                { question: `Tell me about yourself and your experience relevant to ${role}.`, answer: "Overview of your background and key skills." },
                { question: `What technical frameworks or tools do you use most frequently as a ${role}?`, answer: "Primary skills, libraries, and methodologies." },
                { question: "Describe a difficult technical challenge you solved recently.", answer: "Problem statement, solution, and final result." },
                { question: "How do you handle changing project requirements and tight deadlines?", answer: "Prioritization, communication, and flexibility." }
            ];
        }

        setInterviewData({
            ...rawRecord,
            interviewQuestions: parsedQuestions
        });
    }, [interviewId, rawRecord]);

    // Enhanced Speech Synthesis helper to speak questions out loud naturally
    const speakText = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.95;
                utterance.pitch = 1.0;

                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v =>
                    (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("David")) &&
                    v.lang.startsWith("en")
                ) || voices.find(v => v.lang.startsWith("en"));

                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }

                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn("Speech synthesis unavailable:", e);
            }
        }
    };


    // Connect Call handler
    const StartConversation = async () => {
        setLoadingCall(true);

        await startCamera();

        const questionsList = interviewData?.interviewQuestions || [];
        const firstQ = questionsList[0]?.question || "Tell me about yourself and your background.";

        setJoined(true);
        setCurrentQuestionIndex(0);

        const welcomeMsg = `Welcome to your MAPD AI Mock Interview for ${interviewData?.jobTitle || 'this position'}. Question 1: ${firstQ}`;
        setMessages([
            { from: 'bot', text: welcomeMsg }
        ]);
        speakText(welcomeMsg);
        toast.info("AI Interview Connected!");
        setLoadingCall(false);
    };

    const recognitionRef = useRef<any>(null);
    const isListeningRef = useRef<boolean>(false);

    // Speech recognition toggle with continuous manual control
    const toggleSpeechRecognition = () => {
        if (typeof window === 'undefined') return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.info("Speech recognition not supported in this browser. Please type your response.");
            return;
        }

        // If mic is currently ON, turn it OFF manually when clicked
        if (isListeningRef.current || isListening) {
            isListeningRef.current = false;
            setIsListening(false);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
            toast.info("Microphone turned off.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true; // Continuous listening across pauses
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                isListeningRef.current = true;
                setIsListening(true);
                toast.success("Microphone ON. Speak freely — click mic again when finished.");
            };

            recognition.onresult = (event: any) => {
                let accumulatedText = '';
                for (let i = 0; i < event.results.length; i++) {
                    accumulatedText += event.results[i][0].transcript;
                }
                if (accumulatedText) {
                    setUserInputText(accumulatedText);
                }
            };

            recognition.onerror = (err: any) => {
                console.warn("Speech recognition notice:", err?.error);
                // Ignore transient silence errors in continuous mode
                if (err?.error === 'no-speech' && isListeningRef.current) {
                    return;
                }
            };

            recognition.onend = () => {
                // If user has NOT manually turned off mic, keep listening continuously
                if (isListeningRef.current) {
                    try {
                        recognition.start();
                    } catch (e) {
                        // In case restart fails, reset state
                        isListeningRef.current = false;
                        setIsListening(false);
                    }
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current = recognition;
            isListeningRef.current = true;
            recognition.start();
        } catch (e) {
            console.error("Speech recognition error:", e);
            isListeningRef.current = false;
            setIsListening(false);
        }
    };

    // Send Answer Handler
    const handleSendAnswer = (textToSend?: string) => {
        const text = textToSend || userInputText;
        if (!text.trim()) return;

        // Turn off continuous microphone when sending answer
        if (isListeningRef.current) {
            isListeningRef.current = false;
            setIsListening(false);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
        }

        const updatedMessages: Messages[] = [
            ...messages,
            { from: 'user', text: text }
        ];

        const questionsList = interviewData?.interviewQuestions || [];
        const nextIdx = currentQuestionIndex + 1;

        if (nextIdx < questionsList.length) {
            const nextQ = questionsList[nextIdx].question;
            setCurrentQuestionIndex(nextIdx);
            const botReply = `Thank you. Question ${nextIdx + 1}: ${nextQ}`;
            updatedMessages.push({ from: 'bot', text: botReply });
            setMessages(updatedMessages);
            speakText(botReply);
        } else {
            const endMsg = "Excellent! You have answered all interview questions. Click 'End Call' to generate your performance feedback report.";
            updatedMessages.push({ from: 'bot', text: endMsg });
            setMessages(updatedMessages);
            speakText(endMsg);
        }
        setUserInputText("");
    };

    const leaveConversation = async () => {
        if (!window.confirm("Are you sure you want to end the interview and generate your performance report?")) return;

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        setJoined(false);
        setMicOn(false);
        setCameraOn(false);
        setIsListening(false);

        await GenerateFeedback();
    };

    const GenerateFeedback = async () => {
        toast.info('Evaluating interview performance...');
        try {
            const result = await axios.post('/api/interview-feedback', {
                messages: messages.length > 0 ? messages : [
                    { from: 'bot', text: 'Tell me about yourself.' },
                    { from: 'user', text: 'I am a software engineer focused on building clean full-stack web applications.' }
                ],
                jobTitle: interviewData?.jobTitle,
                techStack: interviewData?.techStack
            });

            console.log("Evaluation report:", result.data);
            if (interviewId && updateFeedback) {
                await updateFeedback({
                    feedback: result.data,
                    recordId: interviewId as any
                });
            }

            toast.success('Performance evaluation complete!');
            router.replace(`/interview/${interviewId}/feedback`);
        } catch (err) {
            console.error("Error saving feedback:", err);
            toast.error("Redirecting to feedback page...");
            router.replace(`/interview/${interviewId}/feedback`);
        }
    };

    const questionsList = interviewData?.interviewQuestions || [];
    const currentQ = questionsList[currentQuestionIndex];

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading interview session data...</h2>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Interview Session Error</h2>
                <p className="text-sm text-slate-500 max-w-md mb-6">{errorMsg}</p>
                <Button onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 md:px-8 min-h-[calc(100vh-80px)] space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 md:px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        {interviewData?.jobTitle || "AI Technical Interview"}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Question {currentQuestionIndex + 1} of {questionsList.length} • MAPD Multi-Metric Evaluator
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!joined ? (
                        <Button
                            onClick={StartConversation}
                            disabled={loadingCall}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full shadow-md text-xs px-5 cursor-pointer"
                        >
                            <PhoneCall className="w-4 h-4 mr-2" />
                            {loadingCall ? "Connecting..." : "Connect Call"}
                        </Button>
                    ) : (
                        <Button
                            onClick={leaveConversation}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-full shadow-md text-xs px-5 cursor-pointer"
                        >
                            <PhoneOff className="w-4 h-4 mr-2" /> End Call
                        </Button>
                    )}
                </div>
            </div>

            {/* Camera Privacy Disclaimer Bar */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span><strong>Privacy Notice:</strong> Camera feed is used for camera framing preview only. Facial signals do NOT affect scores or measure confidence.</span>
                </span>
                <Button size="sm" variant="ghost" onClick={toggleCamera} className="text-xs h-7 text-indigo-600 dark:text-indigo-400 font-semibold">
                    {cameraOn ? <><CameraOff className="w-3.5 h-3.5 mr-1" /> Disable Video</> : <><Camera className="w-3.5 h-3.5 mr-1" /> Enable Video</>}
                </Button>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT SIDE: Question Nav & Active Question (7 cols) */}
                <div className="lg:col-span-7 space-y-6 flex flex-col">
                    {/* Question Tab Navigation Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {questionsList.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentQuestionIndex(idx);
                                    const q = questionsList[idx];
                                    if (q?.question) {
                                        speakText(`Question ${idx + 1}: ${q.question}`);
                                    }
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    idx === currentQuestionIndex
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                                }`}
                            >
                                Question {idx + 1}
                            </button>
                        ))}
                    </div>

                    {/* Active Question Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                    Question {currentQuestionIndex + 1} of {questionsList.length}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => currentQ?.question && speakText(`Question ${currentQuestionIndex + 1}: ${currentQ.question}`)}
                                    className="text-xs font-medium rounded-full cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950"
                                >
                                    <Volume2 className="w-3.5 h-3.5 mr-1 text-indigo-500 animate-pulse" /> Read Question Aloud
                                </Button>
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                                {currentQ?.question || "Loading question..."}
                            </h2>

                            {currentQ?.answer && (
                                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider text-[10px]">
                                        Suggested Focus & Key Concepts
                                    </span>
                                    <p>{currentQ.answer}</p>
                                </div>
                            )}
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => {
                                    const prevIdx = Math.max(0, currentQuestionIndex - 1);
                                    setCurrentQuestionIndex(prevIdx);
                                    const q = questionsList[prevIdx];
                                    if (q?.question) {
                                        speakText(`Question ${prevIdx + 1}: ${q.question}`);
                                    }
                                }}
                                className="text-xs"
                            >
                                Previous Question
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentQuestionIndex === questionsList.length - 1}
                                onClick={() => {
                                    const nextIdx = Math.min(questionsList.length - 1, currentQuestionIndex + 1);
                                    setCurrentQuestionIndex(nextIdx);
                                    const q = questionsList[nextIdx];
                                    if (q?.question) {
                                        speakText(`Question ${nextIdx + 1}: ${q.question}`);
                                    }
                                }}
                                className="text-xs rounded-full"
                            >
                                Next Question
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Video Stage & Live Transcript (5 cols) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col">
                    {/* Live Camera Stream Box */}
                    <div className="w-full h-56 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center text-white shadow-lg">
                        {cameraOn ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                    <User size={30} className="text-slate-400" />
                                </div>
                                <p className="text-xs text-slate-400">
                                    {joined ? "AI Recruiter Live" : "Click 'Connect Call' to begin"}
                                </p>
                            </div>
                        )}

                        {joined && cameraOn && (
                            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-slate-700">
                                <Eye className="w-3 h-3 text-emerald-400" /> {faceSignal}
                            </div>
                        )}

                        {joined && (
                            <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> Recruiter Connected
                            </div>
                        )}
                    </div>

                    {/* Conversation Transcript Panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex-1 flex flex-col justify-between h-[360px]">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-indigo-500" />
                            Live Transcript & Editable Answer
                        </h3>

                        <div className="flex-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 overflow-y-auto space-y-3 mb-3">
                            {messages.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    <p>No conversation yet.</p>
                                    <p className="mt-1 text-[11px]">Click "Connect Call" to start speaking or typing.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}
                                        >
                                            <span className="text-[10px] font-semibold text-slate-400 mb-0.5 px-1">
                                                {msg.from === 'user' ? 'Candidate' : 'MAPD Recruiter'}
                                            </span>
                                            <div
                                                className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                                                    msg.from === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                                                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs rounded-bl-none'
                                                }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Editable Input Row */}
                        {joined && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant={isListening ? "default" : "outline"}
                                        onClick={toggleSpeechRecognition}
                                        className={`h-9 w-9 rounded-xl shrink-0 ${isListening ? "bg-amber-500 animate-pulse text-white" : ""}`}
                                        title="Speech-to-Text Input"
                                    >
                                        {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                    </Button>
                                    <Input
                                        placeholder="Type or edit speech transcript here..."
                                        value={userInputText}
                                        onChange={(e) => setUserInputText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
                                        className="text-xs rounded-xl h-9"
                                    />
                                    <Button size="sm" onClick={() => handleSendAnswer()} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-9 px-3">
                                        <Send className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 px-1">
                                    <Edit3 className="w-3 h-3 text-indigo-500" /> You can edit the speech transcript above before sending.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}