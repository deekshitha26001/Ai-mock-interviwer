import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import axios from "axios";
import { aj } from "@/utils/arcjet";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateRoleAwareQuestions } from "@/lib/roleInterviewerEngine";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_URL_PUBLIC_KEY || "dummy",
    privateKey: process.env.IMAGEKIT_URL_PRIVATE_KEY || "dummy",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
});

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const jobTitleStr = (formData.get('jobTitle') as string) || '';
        const jobDescriptionStr = (formData.get('jobDescription') as string) || '';
        const techStackStr = (formData.get('techStack') as string) || '';
        const experienceLevelStr = (formData.get('experienceLevel') as string) || '1–2 years';

        // Protection check via Arcjet if configured
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

        // Handle file upload if provided
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
                    console.warn("ImageKit upload warning:", imgErr);
                }
            }
        }

        // Generate Role-Aware 8-Phase Interview Progression Questions
        const roleAwareQuestions = generateRoleAwareQuestions(
            jobTitleStr,
            jobDescriptionStr,
            techStackStr,
            experienceLevelStr
        );

        return NextResponse.json({
            questions: roleAwareQuestions,
            resumeUrl: resumeUrl,
            status: 200
        });

    } catch (error: any) {
        console.error('Interview generation endpoint error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate interview questions' },
            { status: 500 }
        );
    }
}