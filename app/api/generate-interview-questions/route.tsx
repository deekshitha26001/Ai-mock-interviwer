import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import axios from "axios";
import { aj } from "@/utils/arcjet";
import { auth, currentUser } from "@clerk/nextjs/server";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_URL_PUBLIC_KEY || "dummy",
    privateKey: process.env.IMAGEKIT_URL_PRIVATE_KEY || "dummy",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
});

const defaultQuestions = (title?: string) => [
    {
        question: `Tell me about yourself and your experience relevant to ${title || 'this role'}.`,
        answer: "Focus on your background, core achievements, and why you are a great fit."
    },
    {
        question: `What technical skills and tools do you use most frequently as a ${title || 'developer'}?`,
        answer: "Mention key frameworks, languages, and development methodologies you master."
    },
    {
        question: "Describe a complex technical challenge you faced recently and how you resolved it.",
        answer: "Outline the situation, your specific technical actions, and the measurable outcome."
    },
    {
        question: "How do you ensure code quality, performance, and maintainability in your work?",
        answer: "Discuss testing, code reviews, architectural principles, and optimization techniques."
    },
    {
        question: "How do you handle tight deadlines or unexpected requirement changes during a project?",
        answer: "Explain your prioritization strategy, communication with stakeholders, and adaptability."
    }
];

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const jobTitleStr = (formData.get('jobTitle') as string) || '';
        const jobDescriptionStr = (formData.get('jobDescription') as string) || '';

        // Rate limiting check via Arcjet (safely guarded)
        if (process.env.ARCJET_KEY && process.env.ARCJET_KEY !== 'ajkey_dummy') {
            try {
                const { has } = await auth();
                const decision = await aj.protect(req, {
                    userId: user?.primaryEmailAddress?.emailAddress ?? 'guest',
                    requested: 5
                });
                const isSubscribedUser = has({ plan: 'pro' });
                if ((decision?.reason as any)?.remaining === 0 && !isSubscribedUser) {
                    return NextResponse.json({
                        status: 429,
                        result: 'No free credit remaining. Try again after 24 Hours.'
                    });
                }
            } catch (arcjetErr) {
                console.warn('Arcjet protection skipped:', arcjetErr);
            }
        }

        let resumeUrl = "";

        // Handle file upload if present
        if (file && typeof file === 'object' && 'arrayBuffer' in file && file.size > 0) {
            if (
                process.env.IMAGEKIT_URL_PUBLIC_KEY &&
                process.env.IMAGEKIT_URL_PRIVATE_KEY &&
                process.env.IMAGEKIT_URL_PRIVATE_KEY !== 'private_dummy'
            ) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const uploadResponse = await imagekit.upload({
                        file: buffer,
                        fileName: `upload-${Date.now()}.pdf`,
                        isPrivateFile: false,
                        useUniqueFileName: true,
                    });
                    resumeUrl = uploadResponse?.url || "";
                } catch (imgErr) {
                    console.warn("ImageKit upload error (continuing with default processing):", imgErr);
                }
            }

            // Call external AI webhook with fallback
            try {
                const result = await axios.post(
                    'https://n8n.srv629238.hstgr.cloud/webhook/generate-interview-question',
                    { resumeUrl: resumeUrl || null },
                    { timeout: 15000 }
                );
                const questions =
                    result.data?.message?.content?.questions ||
                    result.data?.message?.content?.interview_questions ||
                    result.data?.questions ||
                    defaultQuestions(jobTitleStr);

                return NextResponse.json({
                    questions: Array.isArray(questions) && questions.length > 0 ? questions : defaultQuestions(jobTitleStr),
                    resumeUrl: resumeUrl,
                    status: 200
                });
            } catch (apiErr) {
                console.warn("External AI webhook error, returning generated fallback questions:", apiErr);
                return NextResponse.json({
                    questions: defaultQuestions(jobTitleStr || "Software Engineer"),
                    resumeUrl: resumeUrl,
                    status: 200
                });
            }
        } else {
            // Job Description tab flow
            try {
                const result = await axios.post(
                    'https://n8n.srv629238.hstgr.cloud/webhook/generate-interview-question',
                    {
                        resumeUrl: null,
                        jobTitle: jobTitleStr,
                        jobDescription: jobDescriptionStr
                    },
                    { timeout: 15000 }
                );

                const questions =
                    result.data?.message?.content?.questions ||
                    result.data?.message?.content?.interview_questions ||
                    result.data?.questions ||
                    defaultQuestions(jobTitleStr);

                return NextResponse.json({
                    questions: Array.isArray(questions) && questions.length > 0 ? questions : defaultQuestions(jobTitleStr),
                    resumeUrl: null,
                    status: 200
                });
            } catch (apiErr) {
                console.warn("External AI webhook error, returning generated fallback questions:", apiErr);
                return NextResponse.json({
                    questions: defaultQuestions(jobTitleStr || "Software Engineer"),
                    resumeUrl: null,
                    status: 200
                });
            }
        }

    } catch (error: any) {
        console.error('Interview generation endpoint error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate interview questions' },
            { status: 500 }
        );
    }
}