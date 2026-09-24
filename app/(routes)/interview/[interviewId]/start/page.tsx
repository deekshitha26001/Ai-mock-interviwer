"use client"
import { api } from '@/convex/_generated/api';
import axios from 'axios';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneCall, PhoneOff, User, Volume2, Sparkles, CheckCircle2, MessageSquare, Send, ArrowLeft, AlertCircle, Loader2, Camera, CameraOff, Eye, ShieldCheck, Edit3, Bookmark, BookmarkCheck, Keyboard, Activity, Flame, Smile, Play, Pause, Square, Radio, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackInfo } from '@/app/(routes)/dashboard/_components/FeedbackDialog';
import { Input } from '@/components/ui/input';
import AudioVisualizer from './_components/AudioVisualizer';
import QuestionTimer from './_components/QuestionTimer';
import VoiceSettings from './_components/VoiceSettings';
import { analyzeVideoFrame, FacialMetrics } from '@/utils/facialAnalysis';
import { uploadRecordingToCloud } from '@/utils/recordingStorage';
import { useUser } from '@clerk/nextjs';

export type InterviewData = {
    jobTitle: string | null,
    jobDescription: string | null,
    techStack?: string | null,
    experienceLevel?: string | null,
    interviewQuestions: InterviewQuestions[],
    userId: string | null,
    _id: string,
    _creationTime?: number,
    resumeUrl: string | null,
    status: string | null,
    feedback?: FeedbackInfo | null,
    recordingUrl?: string | null,
    recordingId?: string | null,
    fileSize?: number | null,
    durationSeconds?: number | null,
    storageProvider?: string | null,
    questionTimestamps?: any,
    candidateAnswers?: any
}

type InterviewQuestions = {
    answer: string,
    question: string,
    category?: string
}

type Messages = {
    from: 'user' | 'bot',
    text: string,
    isFollowUp?: boolean
}

type QuestionTimestamp = {
    questionIndex: number;
    question: string;
    timestampSeconds: number;
    formattedTime: string;
}

type CandidateAnswerRecord = {
    question: string;
    answer: string;
    timestampSeconds: number;
}

export default function StartInterview() {
    const params = useParams();
    const interviewId = params?.interviewId as string;
    const router = useRouter();
    const { user } = useUser();

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

    // Recording & Upload States
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingSaved, setRecordingSaved] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [savedRecordingUrl, setSavedRecordingUrl] = useState<string>('');
    const [savedRecordingId, setSavedRecordingId] = useState<string>('');
    const [savedFileSize, setSavedFileSize] = useState<number>(0);
    const [savedStorageProvider, setSavedStorageProvider] = useState<string>('cloud');

    const [questionTimestamps, setQuestionTimestamps] = useState<QuestionTimestamp[]>([]);
    const [candidateAnswers, setCandidateAnswers] = useState<CandidateAnswerRecord[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastVideoBlobRef = useRef<Blob | null>(null);

    const [faceSignal, setFaceSignal] = useState<string>("Face Centered");
    const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);

    const [liveFacialMetrics, setLiveFacialMetrics] = useState<FacialMetrics>({
        eyeContactPercentage: 92,
        stressIndex: 18,
        confidenceScore: 8.8,
        primaryExpression: "Composed & Focused",
        composureLevel: "High",
        headPoseStatus: "Centered",
        luminanceQuality: "Good"
    });

    const [speechRate, setSpeechRate] = useState<number>(1.0);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
    const [bookmarkedIndices, setBookmarkedIndices] = useState<number[]>([]);

    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Continuous Real-Time Video Frame Analyzer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (cameraOn && videoRef.current) {
            interval = setInterval(() => {
                if (videoRef.current) {
                    const metrics = analyzeVideoFrame(videoRef.current);
                    if (metrics) {
                        setLiveFacialMetrics(metrics);
                        setFaceSignal(`${metrics.headPoseStatus} (${metrics.eyeContactPercentage}% Eye Contact)`);
                    }
                }
            }, 1200);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [cameraOn]);

    const convex = useConvex();
    const updateFeedback = useMutation(api.Interview.UpdateFeedback);
    const saveInterviewRecording = useMutation(api.Interview.SaveInterviewRecording);

    // Fetch interview record from Convex
    const rawRecord = useQuery(
        api.Interview.GetInterviewQuestions,
        interviewId ? { interviewRecordId: interviewId as any } : "skip"
    );

    // Clean up tracks and intervals on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (cameraOn && videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [cameraOn, mediaStream]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            mediaStreamRef.current = stream;
            setMediaStream(stream);
            setCameraOn(true);
            setCameraPermissionError(null);
            return stream;
        } catch (e) {
            console.warn("Combined stream request warning:", e);
        }

        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            mediaStreamRef.current = videoStream;
            setMediaStream(videoStream);
            setCameraOn(true);
            setCameraPermissionError(null);
            return videoStream;
        } catch (videoErr: any) {
            console.warn("Camera init warning:", videoErr);
            setCameraPermissionError("Camera disabled or unavailable. Video preview is optional.");
            setCameraOn(false);
            return null;
        }
    };

    const toggleCamera = async () => {
        if (cameraOn) {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getVideoTracks().forEach(t => t.stop());
            }
            setMediaStream(null);
            setCameraOn(false);
            toast.info("Camera turned off. Continuing with microphone/text.");
        } else {
            await startCamera();
        }
    };

    useEffect(() => {
        startCamera();
    }, []);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Upload video blob to persistent cloud storage
    const uploadVideoToCloudStorage = async (videoBlob: Blob) => {
        if (!interviewId || videoBlob.size === 0) return;
        lastVideoBlobRef.current = videoBlob;

        setUploadStatus('uploading');
        setUploadProgress(0);

        try {
            toast.info("Uploading recording to persistent storage...");
            const res = await uploadRecordingToCloud(
                interviewId,
                videoBlob,
                recordingDuration,
                (pct) => setUploadProgress(pct)
            );

            if (res.recordingUrl) {
                setSavedRecordingUrl(res.recordingUrl);
                setSavedRecordingId(res.recordingId || '');
                setSavedFileSize(res.fileSize || videoBlob.size);
                setSavedStorageProvider(res.storageProvider || 'cloud');
                setUploadStatus('success');
                setRecordingSaved(true);

                // Save persistent recording URL reference in Convex
                await saveInterviewRecording({
                    recordId: interviewId as any,
                    recordingUrl: res.recordingUrl,
                    recordingId: res.recordingId,
                    fileSize: res.fileSize || videoBlob.size,
                    durationSeconds: recordingDuration,
                    storageProvider: res.storageProvider || 'cloud'
                });

                toast.success("Recording uploaded and permanently saved!");
            } else {
                throw new Error("No URL returned from upload provider");
            }
        } catch (err: any) {
            console.error("Cloud upload error:", err);
            setUploadStatus('error');
            toast.error("Recording upload failed. Click 'Retry Upload' to try again.");
        }
    };

    const retryCloudUpload = async () => {
        if (lastVideoBlobRef.current) {
            await uploadVideoToCloudStorage(lastVideoBlobRef.current);
        } else {
            toast.error("No recorded media blob available to retry.");
        }
    };

    // Recording Handlers
    const startRecordingSession = async () => {
        let stream = mediaStreamRef.current;
        if (!stream || stream.getTracks().length === 0) {
            stream = await startCamera();
        }

        if (!stream) {
            toast.error("Microphone/Camera permission required to record.");
            return;
        }

        try {
            recordedChunksRef.current = [];
            let options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9,opus' };
            if (options.mimeType && !MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm;codecs=vp8,opus' };
                if (options.mimeType && !MediaRecorder.isTypeSupported(options.mimeType)) {
                    options = { mimeType: 'video/webm' };
                }
            }

            const mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                if (blob.size > 0 && interviewId) {
                    await uploadVideoToCloudStorage(blob);
                }
            };

            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setIsPaused(false);
            setRecordingSaved(false);

            const qList = interviewData?.interviewQuestions || [];
            if (qList[0]) {
                setQuestionTimestamps([{
                    questionIndex: 0,
                    question: qList[0].question,
                    timestampSeconds: 0,
                    formattedTime: "00:00"
                }]);
            }

            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            toast.success("Recording started!");

        } catch (err: any) {
            console.error("Failed to start MediaRecorder:", err);
            toast.error("Failed to start video recorder: " + (err?.message || "Permission issue"));
        }
    };

    const pauseRecordingSession = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            toast.info("Recording paused.");
        }
    };

    const resumeRecordingSession = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
            toast.info("Recording resumed.");
        }
    };

    const stopRecordingSession = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeTag = document.activeElement?.tagName.toLowerCase();
            const isInput = activeTag === 'input' || activeTag === 'textarea';

            if (e.key === ' ' && !isInput && joined) {
                e.preventDefault();
                toggleSpeechRecognition();
            } else if (e.key === 'Enter' && e.ctrlKey && joined) {
                e.preventDefault();
                handleSendAnswer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [joined, userInputText]);

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

        let parsedQuestions: InterviewQuestions[] = [];
        const rawQ = rawRecord.interviewQuestions;

        if (Array.isArray(rawQ)) {
            parsedQuestions = rawQ.map((q: any) => {
                if (typeof q === 'string') return { question: q, answer: '' };
                return { question: q.question || q.q || String(q), answer: q.answer || q.a || '', category: q.category };
            });
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

    const speakText = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = speechRate || 1.0;
                utterance.pitch = 1.0;

                const voices = window.speechSynthesis.getVoices();
                let selected = voices.find(v => v.name === selectedVoiceName);

                if (!selected) {
                    selected = voices.find(v =>
                        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("David")) &&
                        v.lang.startsWith("en")
                    ) || voices.find(v => v.lang.startsWith("en"));
                }

                if (selected) {
                    utterance.voice = selected;
                }

                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn("Speech synthesis notice:", e);
            }
        }
    };

    const toggleBookmark = (index: number) => {
        setBookmarkedIndices(prev => {
            const exists = prev.includes(index);
            const updated = exists ? prev.filter(i => i !== index) : [...prev, index];
            try {
                const currentQ = (interviewData?.interviewQuestions || [])[index];
                if (currentQ) {
                    const savedKey = "mapd_saved_flashcards";
                    const existingStr = localStorage.getItem(savedKey) || "[]";
                    const existingList = JSON.parse(existingStr);
                    if (exists) {
                        const filtered = existingList.filter((q: any) => q.question !== currentQ.question);
                        localStorage.setItem(savedKey, JSON.stringify(filtered));
                        toast.info("Removed from saved flashcards.");
                    } else {
                        existingList.push({ ...currentQ, jobTitle: interviewData?.jobTitle || "Technical Role" });
                        localStorage.setItem(savedKey, JSON.stringify(existingList));
                        toast.success("Saved to flashcards!");
                    }
                }
            } catch (e) {
                console.warn("Bookmark storage notice:", e);
            }
            return updated;
        });
    };

    const StartConversation = async () => {
        setLoadingCall(true);

        await startCamera();
        await startRecordingSession();

        const questionsList = interviewData?.interviewQuestions || [];
        const firstQ = questionsList[0]?.question || "Tell me about yourself and your background.";

        setJoined(true);
        setCurrentQuestionIndex(0);

        const welcomeMsg = `Welcome to your MAPD AI Mock Interview for ${interviewData?.jobTitle || 'this position'}. Question 1: ${firstQ}`;
        setMessages([
            { from: 'bot', text: welcomeMsg }
        ]);
        speakText(welcomeMsg);
        toast.info("AI Recruiter Interview Connected!");
        setLoadingCall(false);
    };

    const recognitionRef = useRef<any>(null);
    const isListeningRef = useRef<boolean>(false);

    const toggleSpeechRecognition = () => {
        if (typeof window === 'undefined') return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.info("Speech recognition not supported in this browser. Please type your response.");
            return;
        }

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
            recognition.continuous = true;
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
                if (err?.error === 'no-speech' && isListeningRef.current) {
                    return;
                }
            };

            recognition.onend = () => {
                if (isListeningRef.current) {
                    try {
                        recognition.start();
                    } catch (e) {
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

    const handleSendAnswer = async (textToSend?: string) => {
        const text = textToSend || userInputText;
        if (!text.trim()) return;

        if (isListeningRef.current) {
            isListeningRef.current = false;
            setIsListening(false);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
        }

        const questionsList = interviewData?.interviewQuestions || [];
        const currentQObj = questionsList[currentQuestionIndex];
        const currentQText = currentQObj?.question || "";

        const answerRecord: CandidateAnswerRecord = {
            question: currentQText,
            answer: text,
            timestampSeconds: recordingDuration
        };

        setCandidateAnswers(prev => [...prev, answerRecord]);

        const updatedMessages: Messages[] = [
            ...messages,
            { from: 'user', text: text }
        ];

        setUserInputText("");

        try {
            const followUpRes = await axios.post('/api/generate-followup-question', {
                currentQuestion: currentQText,
                candidateAnswer: text,
                jobTitle: interviewData?.jobTitle,
                techStack: interviewData?.techStack
            });

            if (followUpRes.data?.hasFollowUp && followUpRes.data?.followUpQuestion) {
                const followUpText = followUpRes.data.followUpQuestion;
                const botFollowUpMsg = `Follow-Up: ${followUpText}`;
                updatedMessages.push({ from: 'bot', text: botFollowUpMsg, isFollowUp: true });
                setMessages(updatedMessages);
                speakText(botFollowUpMsg);
                return;
            }
        } catch (fErr) {
            console.warn("Follow-up check skipped:", fErr);
        }

        const nextIdx = currentQuestionIndex + 1;
        if (nextIdx < questionsList.length) {
            const nextQ = questionsList[nextIdx].question;
            setCurrentQuestionIndex(nextIdx);

            setQuestionTimestamps(prev => [
                ...prev,
                {
                    questionIndex: nextIdx,
                    question: nextQ,
                    timestampSeconds: recordingDuration,
                    formattedTime: formatTime(recordingDuration)
                }
            ]);

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
    };

    const leaveConversation = async () => {
        if (!window.confirm("Are you sure you want to end the interview and generate your performance report?")) return;

        stopRecordingSession();

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
                techStack: interviewData?.techStack,
                candidateAnswers: candidateAnswers,
                durationSeconds: recordingDuration
            });

            if (interviewId && updateFeedback) {
                await updateFeedback({
                    feedback: result.data,
                    recordId: interviewId as any,
                    durationSeconds: recordingDuration,
                    questionTimestamps: questionTimestamps,
                    candidateAnswers: candidateAnswers,
                    weakTopics: result.data.knowledgeGaps || [],
                    recordingUrl: savedRecordingUrl || `idb://${interviewId}`
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
            {/* Top Header Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 md:px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        {interviewData?.jobTitle || "AI Technical Interview"}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Question {currentQuestionIndex + 1} of {questionsList.length} • MAPD Realistic Recruiter Engine
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <VoiceSettings
                        speechRate={speechRate}
                        setSpeechRate={setSpeechRate}
                        selectedVoiceName={selectedVoiceName}
                        setSelectedVoiceName={setSelectedVoiceName}
                    />

                    {!joined ? (
                        <Button
                            onClick={StartConversation}
                            disabled={loadingCall}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full shadow-md text-xs px-5 cursor-pointer"
                        >
                            <PhoneCall className="w-4 h-4 mr-2" />
                            {loadingCall ? "Connecting..." : "Start Interview & Recording"}
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

            {/* Recording & Upload Progress Status Bar */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {isRecording && !isPaused && (
                            <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-bold px-3 py-1 rounded-full animate-pulse">
                                <Radio className="w-3.5 h-3.5 text-rose-500" /> REC {formatTime(recordingDuration)}
                            </span>
                        )}
                        {isPaused && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-3 py-1 rounded-full">
                                PAUSED {formatTime(recordingDuration)}
                            </span>
                        )}
                        {uploadStatus === 'uploading' && (
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-indigo-400 animate-bounce" /> Uploading {uploadProgress}%
                            </span>
                        )}
                        {uploadStatus === 'success' && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Persistent Recording Saved
                            </span>
                        )}
                        {uploadStatus === 'error' && (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Recording Upload Failed
                            </span>
                        )}
                    </div>
                </div>

                {/* Explicit Recording & Retry Controls */}
                <div className="flex items-center gap-2">
                    {uploadStatus === 'error' && (
                        <Button
                            size="sm"
                            onClick={retryCloudUpload}
                            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-full px-4 h-8 cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry Upload
                        </Button>
                    )}

                    {!isRecording ? (
                        <Button
                            size="sm"
                            onClick={startRecordingSession}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full px-4 h-8 cursor-pointer"
                        >
                            <Play className="w-3.5 h-3.5 mr-1.5 fill-white" /> Start Recording
                        </Button>
                    ) : (
                        <>
                            {isPaused ? (
                                <Button
                                    size="sm"
                                    onClick={resumeRecordingSession}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full px-3 h-8 cursor-pointer"
                                >
                                    <Play className="w-3.5 h-3.5 mr-1" /> Resume
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={pauseRecordingSession}
                                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-full px-3 h-8 cursor-pointer"
                                >
                                    <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                                </Button>
                            )}

                            <Button
                                size="sm"
                                onClick={stopRecordingSession}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-full px-3 h-8 cursor-pointer"
                            >
                                <Square className="w-3.5 h-3.5 mr-1 text-rose-400 fill-rose-400" /> Stop & Upload
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT SIDE: Question Nav & Active Question (7 cols) */}
                <div className="lg:col-span-7 space-y-6 flex flex-col">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {questionsList.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentQuestionIndex(idx);
                                    if (q?.question) {
                                        speakText(`Question ${idx + 1}: ${q.question}`);
                                    }
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                    idx === currentQuestionIndex
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                                }`}
                            >
                                <span>Question {idx + 1}</span>
                                {bookmarkedIndices.includes(idx) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                        Question {currentQuestionIndex + 1} of {questionsList.length}
                                    </span>
                                    {currentQ?.category && (
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                                            {currentQ.category}
                                        </span>
                                    )}
                                    <QuestionTimer keyIndex={currentQuestionIndex} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => toggleBookmark(currentQuestionIndex)}
                                        className={`text-xs h-8 px-2.5 rounded-xl border ${
                                            bookmarkedIndices.includes(currentQuestionIndex)
                                                ? "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                                                : "border-slate-200 dark:border-slate-800 text-slate-500"
                                        }`}
                                    >
                                        {bookmarkedIndices.includes(currentQuestionIndex) ? (
                                            <><BookmarkCheck className="w-3.5 h-3.5 mr-1 text-amber-500" /> Bookmarked</>
                                        ) : (
                                            <><Bookmark className="w-3.5 h-3.5 mr-1" /> Bookmark</>
                                        )}
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => currentQ?.question && speakText(`Question ${currentQuestionIndex + 1}: ${currentQ.question}`)}
                                        className="text-xs font-medium rounded-full cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950"
                                    >
                                        <Volume2 className="w-3.5 h-3.5 mr-1 text-indigo-500 animate-pulse" /> Read Aloud
                                    </Button>
                                </div>
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                                {currentQ?.question || "Loading question..."}
                            </h2>

                            {currentQ?.answer && (
                                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider text-[10px]">
                                        Suggested Recruiter Focus
                                    </span>
                                    <p>{currentQ.answer}</p>
                                </div>
                            )}
                        </div>

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

                {/* RIGHT SIDE: Camera Stage & Live Transcript (5 cols) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col">
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
                                    {joined ? "AI Recruiter Live" : "Click 'Start Interview & Recording' to begin"}
                                </p>
                            </div>
                        )}

                        {joined && cameraOn && (
                            <>
                                <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-slate-700/80 text-slate-200">
                                    <Eye className="w-3 h-3 text-emerald-400" /> {faceSignal}
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                                    <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-300">
                                        <Activity className="w-3 h-3 text-indigo-400" />
                                        <span>Composure: <strong className="text-emerald-400">{liveFacialMetrics.composureLevel}</strong></span>
                                    </div>
                                    <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-300">
                                        <Smile className="w-3 h-3 text-amber-400" />
                                        <span>Confidence: <strong className="text-white">{liveFacialMetrics.confidenceScore}/10</strong></span>
                                    </div>
                                </div>
                            </>
                        )}

                        {joined && (
                            <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> Recruiter Connected
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex-1 flex flex-col justify-between h-[360px]">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-indigo-500" />
                            Live Transcript & Adaptive Dialogue
                        </h3>

                        <div className="flex-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 overflow-y-auto space-y-3 mb-3">
                            {messages.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs">
                                    <p>No conversation yet.</p>
                                    <p className="mt-1 text-[11px]">Click "Start Interview & Recording" to speak or type.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}
                                        >
                                            <span className="text-[10px] font-semibold text-slate-400 mb-0.5 px-1">
                                                {msg.from === 'user' ? 'Candidate' : msg.isFollowUp ? 'MAPD Recruiter (Follow-Up)' : 'MAPD Recruiter'}
                                            </span>
                                            <div
                                                className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                                                    msg.from === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                                                        : msg.isFollowUp
                                                        ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800 shadow-xs rounded-bl-none font-medium'
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

                        {joined && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <AudioVisualizer isListening={isListening} stream={mediaStream} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant={isListening ? "default" : "outline"}
                                        onClick={toggleSpeechRecognition}
                                        className={`h-9 w-9 rounded-xl shrink-0 ${isListening ? "bg-amber-500 animate-pulse text-white" : ""}`}
                                        title="Speech-to-Text Input (Spacebar)"
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
                                    <Button size="sm" onClick={() => handleSendAnswer()} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-9 px-3 cursor-pointer">
                                        <Send className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}