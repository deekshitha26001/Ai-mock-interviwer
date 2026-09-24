import { NextRequest, NextResponse } from "next/server";
import { generateAdaptiveFollowUp } from "@/lib/roleInterviewerEngine";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { currentQuestion, candidateAnswer, jobTitle, techStack, experienceLevel, currentPhase } = body;

        const analysis = await generateAdaptiveFollowUp({
            currentQuestion: currentQuestion || "Tell me about yourself.",
            candidateAnswer: candidateAnswer || "",
            jobTitle: jobTitle || "Software Engineer",
            techStack: techStack || "Core Engineering Stack",
            experienceLevel: experienceLevel || "1–2 years",
            currentPhase: currentPhase || 1,
            apiKey: process.env.GEMINI_API_KEY
        });

        return NextResponse.json(analysis);

    } catch (error: any) {
        console.error("Follow-up generation error:", error);
        return NextResponse.json({
            hasFollowUp: false,
            followUpQuestion: null,
            reason: "error_fallback"
        }, { status: 500 });
    }
}
