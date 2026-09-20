import React, { useContext, useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResumeUpload from './ResumeUpload'
import JobDescription from './JobDescription'
import axios from 'axios'
import { Loader2Icon } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

function CreateInterviewDialog() {
    const [activeTab, setActiveTab] = useState('resume-upload');
    const [formData, setFormData] = useState<any>({});
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { user } = useUser();
    const { userDetail } = useContext(UserDetailContext);
    const createNewUser = useMutation(api.users.CreateNewUser);
    const saveInterviewQuestion = useMutation(api.Interview.SaveInterviewQuestion);
    const router = useRouter();

    const onHandleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }

    const onSubmit = async () => {
        // Validation check for active tab
        if (activeTab === 'resume-upload' && !file) {
            toast.error('Please upload a PDF resume file.');
            return;
        }

        if (activeTab === 'job-description' && (!formData?.jobTitle || !formData?.jobDescription)) {
            toast.error('Please enter both Job Title and Job Description.');
            return;
        }

        setLoading(true);
        try {
            // Ensure Convex User ID is available
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

            const formData_ = new FormData();
            if (activeTab === 'resume-upload' && file) {
                formData_.append('file', file);
            }
            if (formData?.jobTitle) {
                formData_.append('jobTitle', formData.jobTitle);
            }
            if (formData?.jobDescription) {
                formData_.append('jobDescription', formData.jobDescription);
            }

            const res = await axios.post('/api/generate-interview-questions', formData_);
            console.log("API response:", res.data);

            if (res?.data?.status === 429) {
                toast.warning(res?.data?.result || 'Rate limit reached.');
                return;
            }

            if (res?.data?.error) {
                toast.error(res?.data?.error);
                return;
            }

            const questions = res.data?.questions || [];
            if (!questions || questions.length === 0) {
                toast.error("Failed to generate interview questions. Please try again.");
                return;
            }

            if (!userId) {
                toast.error("User session missing. Please sign in again.");
                return;
            }

            // Save to Database
            const interviewId = await saveInterviewQuestion({
                questions: questions,
                resumeUrl: res?.data?.resumeUrl ?? '',
                uid: userId,
                jobTitle: formData?.jobTitle ?? (activeTab === 'resume-upload' ? 'Resume Interview' : 'Job Interview'),
                jobDescription: formData?.jobDescription ?? ''
            });

            toast.success("Interview session created successfully!");
            setOpen(false);
            router.push('/interview/' + interviewId);

        } catch (e: any) {
            console.error('Submit error:', e);
            const errMsg = e.response?.data?.error || e.message || 'An error occurred during submission.';
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>+ Create Interview</Button>
            </DialogTrigger>
            <DialogContent className='min-w-3xl'>
                <DialogHeader>
                    <DialogTitle>Please submit following details.</DialogTitle>
                    <DialogDescription>
                        <Tabs defaultValue="resume-upload" value={activeTab} onValueChange={setActiveTab} className="w-full mt-5">
                            <TabsList>
                                <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                                <TabsTrigger value="job-description">Job Description</TabsTrigger>
                            </TabsList>
                            <TabsContent value="resume-upload">
                                <ResumeUpload setFiles={(f: any) => setFile(f)} />
                            </TabsContent>
                            <TabsContent value="job-description">
                                <JobDescription onHandleInputChange={onHandleInputChange} />
                            </TabsContent>
                        </Tabs>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='flex gap-6'>
                    <DialogClose asChild>
                        <Button variant={'ghost'}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading && <Loader2Icon className='animate-spin mr-2' />} Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateInterviewDialog