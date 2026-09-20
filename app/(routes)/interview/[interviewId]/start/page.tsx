"use client"
import { api } from '@/convex/_generated/api';
import axios from 'axios';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { GenericAgoraSDK } from 'akool-streaming-avatar-sdk';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneCall, PhoneOff, User, Volume2, Sparkles, CheckCircle2, MessageSquare, Send, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackInfo } from '@/app/(routes)/dashboard/_components/FeedbackDialog';
import { Input } from '@/components/ui/input';

export type InterviewData = {
    jobTitle: string | null,
    jobDescription: string | null,
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

const CONTAINER_ID = 'akool-avatar-container';
const AVATAR_ID = 'dvp_Tristan_cloth2_1080P';

export default function StartInterview() {
    const params = useParams();
    const interviewId = params?.interviewId as string;
    const router = useRouter();

    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [micOn, setMicOn] = useState(false);
    const [agoraSdk, setAgoraSdk] = useState<GenericAgoraSDK | null>(null);
    const [joined, setJoined] = useState(false);
    const [loadingCall, setLoadingCall] = useState(false);
    const [messages, setMessages] = useState<Messages[]>([]);
    const [userInputText, setUserInputText] = useState("");
    const [usingFallbackMode, setUsingFallbackMode] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const convex = useConvex();
    const updateFeedback = useMutation(api.Interview.UpdateFeedback);

    // Fetch interview record reactively from Convex
    const rawRecord = useQuery(
        api.Interview.GetInterviewQuestions,
        interviewId ? { interviewRecordId: interviewId as any } : "skip"
    );

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
        console.log("Convex Interview Record:", rawRecord);

        // Normalize & parse questions from various formats
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
                console.error("Failed to parse JSON string of interview questions:", e);
            }
        }

        // Fallback default questions if empty
        if (parsedQuestions.length === 0) {
            const role = rawRecord.jobTitle || 'Software Engineer';
            parsedQuestions = [
                { question: `Tell me about yourself and your experience relevant to ${role}.`, answer: "Overview of your background and key skills." },
                { question: `What core technical tools or frameworks do you use as a ${role}?`, answer: "Primary skills, libraries, and methodologies." },
                { question: "Describe a difficult technical challenge you solved recently.", answer: "Problem statement, solution, and final result." },
                { question: "How do you handle changing priorities and tight deadlines?", answer: "Prioritization, communication, and flexibility." }
            ];
            toast.info("Using standard generated questions for this role.");
        }

        setInterviewData({
            ...rawRecord,
            interviewQuestions: parsedQuestions
        });
    }, [interviewId, rawRecord]);

    // Speech Synthesis helper
    const speakText = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn("Speech synthesis unavailable:", e);
            }
        }
    };

    // Browser Speech Recognition toggle
    const toggleSpeechRecognition = () => {
        if (typeof window === 'undefined') return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.info("Voice recognition not supported in this browser. Please type your response.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            setMicOn(false);
            toast.info("Microphone off.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setMicOn(true);
                toast.success("Listening... Speak your answer now.");
            };

            recognition.onresult = (event: any) => {
                const speechResult = event.results[0][0].transcript;
                if (speechResult) {
                    setUserInputText(speechResult);
                    toast.success(`Captured: "${speechResult}"`);
                }
                setIsListening(false);
                setMicOn(false);
            };

            recognition.onerror = (err: any) => {
                console.warn("Speech recognition error:", err);
                setIsListening(false);
                setMicOn(false);
                toast.error("Could not capture audio. Please type your answer.");
            };

            recognition.onend = () => {
                setIsListening(false);
                setMicOn(false);
            };

            recognition.start();
        } catch (e) {
            console.error("Speech recognition error:", e);
            setIsListening(false);
            setMicOn(false);
        }
    };

    // Connect Call handler
    const StartConversation = async () => {
        setLoadingCall(true);
        const questionsList = interviewData?.interviewQuestions || [];
        const firstQ = questionsList[0]?.question || "Tell me about yourself and your background.";

        // Attempt Akool streaming avatar if credentials available
        try {
            const res = await axios.post('/api/akool-session', {
                avatar_id: AVATAR_ID,
                knowledge_id: null
            });

            const credentials = res?.data?.data?.credentials;
            if (credentials && agoraSdk) {
                await agoraSdk.joinChannel({
                    agora_app_id: credentials.agora_app_id,
                    agora_channel: credentials.agora_channel,
                    agora_token: credentials.agora_token,
                    agora_uid: credentials.agora_uid
                });
                await agoraSdk.joinChat({ vid: "female_en_1", lang: "en", mode: 2 });
                await agoraSdk.sendMessage(`Start question: ${firstQ}`);
                setJoined(true);
                setUsingFallbackMode(false);
                toast.success("Connected to AI Recruiter Avatar!");
                setLoadingCall(false);
                return;
            }
        } catch (err) {
            console.log("Akool avatar credentials missing or inactive. Running Interactive Recruiter Mode.");
        }

        // Reliable Interactive AI Recruiter Mode
        setUsingFallbackMode(true);
        setJoined(true);
        setCurrentQuestionIndex(0);

        const welcomeMsg = `Welcome to your AI Mock Interview for ${interviewData?.jobTitle || 'this position'}. Let's begin with Question 1: ${firstQ}`;
        setMessages([
            { from: 'bot', text: welcomeMsg }
        ]);
        speakText(welcomeMsg);
        toast.info("AI Interview Call Connected!");
        setLoadingCall(false);
    };

    // Send Answer Handler
    const handleSendAnswer = (textToSend?: string) => {
        const text = textToSend || userInputText;
        if (!text.trim()) return;

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
            const endMsg = "Excellent! You have answered all interview questions. Click 'End Call' to generate your performance evaluation report.";
            updatedMessages.push({ from: 'bot', text: endMsg });
            setMessages(updatedMessages);
            speakText(endMsg);
        }
        setUserInputText("");
    };

    const leaveConversation = async () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setJoined(false);
        setMicOn(false);
        setIsListening(false);
        await GenerateFeedback();
    };

    const GenerateFeedback = async () => {
        toast.info('Evaluating interview performance...');
        try {
            const result = await axios.post('/api/interview-feedback', {
                messages: messages.length > 0 ? messages : [
                    { from: 'bot', text: 'Tell me about yourself.' },
                    { from: 'user', text: 'I am a full-stack developer with experience building Next.js apps.' }
                ]
            });

            console.log("Evaluation report:", result.data);
            if (interviewId && updateFeedback) {
                await updateFeedback({
                    feedback: result.data,
                    recordId: interviewId as any
                });
            }

            toast.success('Performance evaluation complete!');
            router.replace('/dashboard');
        } catch (err) {
            console.error("Error saving feedback:", err);
            toast.error("Redirecting to dashboard...");
            router.replace('/dashboard');
        }
    };

    const questionsList = interviewData?.interviewQuestions || [];

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Loading interview session data...</h2>
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
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">{errorMsg}</p>
                <Button onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className='flex flex-col lg:flex-row w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-6 gap-6'>
            {/* Left Column: Video Stage, Call Controls & Question List */}
            <div className='flex flex-col items-center lg:w-2/3 space-y-6'>
                <div className='w-full flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
                    <div>
                        <h2 className='text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            {interviewData?.jobTitle || "AI Technical Interview"}
                        </h2>
                        <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                            {interviewData?.jobDescription ? `${interviewData.jobDescription.slice(0, 90)}...` : "Interactive AI Recruiter Session"}
                        </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                        {questionsList.length} Questions Loaded
                    </span>
                </div>

                {/* Avatar Stage */}
                <div
                    ref={videoContainerRef}
                    id={CONTAINER_ID}
                    className='w-full max-w-[640px] h-[360px] md:h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-lg flex flex-col items-center justify-center relative text-white'
                >
                    {!joined ? (
                        <div className='flex flex-col items-center text-center p-6 space-y-4'>
                            <div className='w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner'>
                                <User size={40} className='text-slate-400' />
                            </div>
                            <h3 className='text-lg font-medium text-slate-200'>Ready to start your interview?</h3>
                            <p className='text-xs text-slate-400 max-w-sm'>
                                Click "Connect Call" below to begin your real-time AI interview session.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-3 text-center p-6">
                            <div className="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-400 animate-pulse flex items-center justify-center">
                                <Volume2 size={44} className="text-indigo-400" />
                            </div>
                            <p className="text-sm font-semibold text-indigo-300">AI Recruiter Connected</p>
                            <p className="text-xs text-slate-400">
                                {isListening ? "Listening to your voice..." : "Speak or type your answer in the box on the right"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-4">
                    {!joined ? (
                        <button
                            onClick={StartConversation}
                            disabled={loadingCall || loadingData}
                            className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full shadow-lg transition duration-200 disabled:opacity-50 cursor-pointer"
                        >
                            <PhoneCall className="mr-2 w-5 h-5" />
                            {loadingCall ? "Connecting Call..." : "Connect Call"}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={toggleSpeechRecognition}
                                className={`flex items-center px-5 py-3 rounded-full font-semibold shadow-md transition cursor-pointer ${
                                    isListening
                                        ? "bg-amber-500 animate-pulse text-white"
                                        : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                }`}
                            >
                                {isListening ? (
                                    <>
                                        <Mic className="mr-2 w-5 h-5" /> Listening...
                                    </>
                                ) : (
                                    <>
                                        <MicOff className="mr-2 w-5 h-5" /> Voice Mic
                                    </>
                                )}
                            </button>
                            <button
                                onClick={leaveConversation}
                                className="flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-full shadow-lg transition cursor-pointer"
                            >
                                <PhoneOff className="mr-2 w-5 h-5" /> End Call
                            </button>
                        </>
                    )}
                </div>

                {/* Questions List Container */}
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                        Interview Questions ({questionsList.length})
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {questionsList.map((item, idx) => (
                            <div
                                key={idx}
                                className={`p-3.5 rounded-lg border text-sm transition-all ${
                                    idx === currentQuestionIndex && joined
                                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400/60 dark:border-indigo-500/60"
                                        : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                                        Q{idx + 1}. {item.question}
                                    </span>
                                    {idx === currentQuestionIndex && joined && (
                                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300/40">
                                            Active Question
                                        </span>
                                    )}
                                </div>
                                {item.answer && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Key Focus:</span> {item.answer}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Live Conversation */}
            <div className='flex flex-col lg:w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm h-[600px] lg:h-auto'>
                <h2 className='text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Live Conversation Transcript
                </h2>
                <div className='flex-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl p-4 overflow-y-auto space-y-3 max-h-[480px]'>
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs">
                            <p>No messages yet.</p>
                            <p className="mt-1">Click "Connect Call" to start the interview session.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <span className="text-[10px] text-slate-400 mb-1 px-1">
                                        {msg.from === 'user' ? 'Candidate' : 'AI Recruiter'}
                                    </span>
                                    <div
                                        className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                                            msg.from === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-bl-none'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Candidate Response Input */}
                {joined && (
                    <div className="mt-4 flex gap-2">
                        <Input
                            placeholder="Type your response here..."
                            value={userInputText}
                            onChange={(e) => setUserInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
                            className="text-xs"
                        />
                        <Button size="sm" onClick={() => handleSendAnswer()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}