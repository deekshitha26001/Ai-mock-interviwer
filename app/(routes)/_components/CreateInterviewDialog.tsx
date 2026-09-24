"use client"
import React, { useContext, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { Loader2Icon, UploadCloud, FileText, X, Sparkles, Briefcase, Code, Clock, CheckCircle2, UserCheck } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

function CreateInterviewDialog() {
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [techStack, setTechStack] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('1–2 years');
    const [interviewerGender, setInterviewerGender] = useState<'male' | 'female'>('female');
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);
    const [open, setOpen] = useState(false);

    const { user } = useUser();
    const { userDetail } = useContext(UserDetailContext);
    const createNewUser = useMutation(api.users.CreateNewUser);
    const saveInterviewQuestion = useMutation(api.Interview.SaveInterviewQuestion);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            setFileError('Please upload a valid PDF document.');
            setFile(null);
            toast.error('Only PDF files are supported.');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setFileError('File size must be under 10MB.');
            setFile(null);
            toast.error('File size exceeds 10MB limit.');
            return;
        }

        setFileError(null);
        setFile(selectedFile);
        toast.success(`Selected file: ${selectedFile.name}`);
    };

    const removeFile = () => {
        setFile(null);
        setFileError(null);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!jobTitle.trim()) {
            toast.error('Please enter the Job Role / Position.');
            return;
        }

        if (!jobDescription.trim()) {
            toast.error('Please enter the Job Description / Tech Stack.');
            return;
        }

        setLoading(true);
        setLoadingStage(1);

        try {
            // Stage 1: User resolution
            let userId = userDetail?._id;
            if (!userId && user) {
                try {
                    const res = await createNewUser({
                        email: user.primaryEmailAddress?.emailAddress ?? '',
                        imageUrl: user.imageUrl ?? '',
                        name: user.fullName ?? 'User'
                    });
                    userId = res?._id || res;
                } catch (userErr) {
                    console.warn('Convex user creation warning:', userErr);
                }
            }

            // Stage 2: Processing AI question generation
            setTimeout(() => setLoadingStage(2), 1200);

            const formData_ = new FormData();
            if (file) {
                formData_.append('file', file);
            }
            formData_.append('jobTitle', jobTitle);
            formData_.append('jobDescription', `${jobDescription}. Tech Stack: ${techStack}. Experience Level: ${experienceLevel}`);

            const res = await axios.post('/api/generate-interview-questions', formData_);
            console.log("API response:", res.data);

            if (res?.data?.status === 429) {
                toast.warning(res?.data?.result || 'Rate limit reached.');
                setLoading(false);
                return;
            }

            if (res?.data?.error) {
                toast.error(res?.data?.error);
                setLoading(false);
                return;
            }

            const questions = res.data?.questions || [];
            if (!questions || questions.length === 0) {
                toast.error("Failed to generate interview questions. Please try again.");
                setLoading(false);
                return;
            }

            if (!userId) {
                toast.error("User session missing. Please sign in again.");
                setLoading(false);
                return;
            }

            // Stage 3: Saving to Convex
            setLoadingStage(3);

            const interviewId = await saveInterviewQuestion({
                questions: questions,
                resumeUrl: res?.data?.resumeUrl ?? '',
                uid: userId,
                jobTitle: jobTitle,
                jobDescription: jobDescription,
                experienceLevel: experienceLevel,
                techStack: techStack || jobTitle,
                interviewerGender: interviewerGender
            });

            toast.success("AI Interview created successfully!");
            setOpen(false);
            resetForm();
            router.push('/interview/' + interviewId);

        } catch (e: any) {
            console.error('Submit error:', e);
            const errMsg = e.response?.data?.error || e.message || 'An error occurred during submission.';
            toast.error(errMsg);
        } finally {
            setLoading(false);
            setLoadingStage(0);
        }
    };

    const resetForm = () => {
        setJobTitle('');
        setJobDescription('');
        setTechStack('');
        setExperienceLevel('1–2 years');
        setFile(null);
        setFileError(null);
    };

    const loadingMessages = [
        "Creating your personalized interview...",
        "Analyzing your role and skills...",
        "Generating technical questions & saving session..."
    ];

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!loading) setOpen(val);
        }}>
            <DialogTrigger asChild>
                <Button size="default" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/25 px-5 transition-all hover:scale-[1.02] cursor-pointer">
                    <Sparkles className="w-4 h-4 mr-2" /> + Create Interview
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px] rounded-2xl p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                {!loading ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                Tell us about your job interview
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                Add details about the role you want to practice for. MAPD AI will generate tailored questions.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={onSubmit} className="space-y-4 mt-4">
                            {/* Job Role */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                    Job Role / Position <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g. Senior Java Developer / Full Stack Engineer"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="text-sm rounded-xl"
                                    required
                                />
                            </div>

                            {/* Job Description & Tech Stack */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Code className="w-3.5 h-3.5 text-indigo-500" />
                                        Tech Stack / Core Tools
                                    </label>
                                    <Input
                                        placeholder="e.g. Java, Spring Boot, SQL, REST APIs"
                                        value={techStack}
                                        onChange={(e) => setTechStack(e.target.value)}
                                        className="text-sm rounded-xl"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                        Years of Experience <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={experienceLevel}
                                        onChange={(e) => setExperienceLevel(e.target.value)}
                                        className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Fresher">Fresher (Entry Level)</option>
                                        <option value="0–1 years">0–1 years</option>
                                        <option value="1–2 years">1–2 years</option>
                                        <option value="2–3 years">2–3 years</option>
                                        <option value="3+ years">3+ years (Senior)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Choose Your AI Interviewer */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                                        Choose Your AI Interviewer <span className="text-rose-500">*</span>
                                    </span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Male Card */}
                                    <div
                                        onClick={() => setInterviewerGender('male')}
                                        className={`cursor-pointer rounded-xl p-3 border-2 transition-all flex items-center gap-3 ${
                                            interviewerGender === 'male'
                                                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 dark:border-indigo-500 shadow-sm'
                                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src="/avatars/male.jpg"
                                                alt="Male AI Interviewer"
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                                            />
                                            {interviewerGender === 'male' && (
                                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">👨 Male</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                                Professional & structured
                                            </p>
                                        </div>
                                    </div>

                                    {/* Female Card */}
                                    <div
                                        onClick={() => setInterviewerGender('female')}
                                        className={`cursor-pointer rounded-xl p-3 border-2 transition-all flex items-center gap-3 ${
                                            interviewerGender === 'female'
                                                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 dark:border-indigo-500 shadow-sm'
                                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src="/avatars/female.jpg"
                                                alt="Female AI Interviewer"
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                                            />
                                            {interviewerGender === 'female' && (
                                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">👩 Female</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                                Professional & conversational
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                    Job Description / Key Requirements <span className="text-rose-500">*</span>
                                </label>
                                <Textarea
                                    placeholder="Paste job responsibilities, required skills, framework expectations..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    rows={3}
                                    className="text-sm rounded-xl resize-none"
                                    required
                                />
                            </div>

                            {/* Optional Resume Upload */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
                                        Optional Resume Upload (PDF)
                                    </span>
                                    <span className="text-[10px] text-slate-400">Max 10MB</span>
                                </label>

                                {!file ? (
                                    <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition bg-slate-50/50 dark:bg-slate-900/50">
                                        <UploadCloud className="w-7 h-7 text-indigo-500 mb-1" />
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to upload your resume PDF</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">MAPD AI will extract projects & skills</span>
                                        <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                            <div className="truncate">
                                                <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                                                <p className="text-[10px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB PDF</p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-rose-500" onClick={removeFile}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                                {fileError && <p className="text-[11px] text-rose-500 font-medium">{fileError}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-full text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-md px-6 text-xs cursor-pointer">
                                    Generate Interview
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    /* Animated Loading Screen */
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                            <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {loadingMessages[Math.min(loadingStage, 2)]}
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm">
                                MAPD AI is curating technical and role-specific interview questions based on your input.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-4 py-1.5 rounded-full border border-indigo-200/50">
                            <CheckCircle2 className="w-4 h-4 animate-bounce" />
                            Role: {jobTitle} ({experienceLevel})
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default CreateInterviewDialog;