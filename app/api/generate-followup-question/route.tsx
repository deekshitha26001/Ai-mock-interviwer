import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { currentQuestion, candidateAnswer, jobTitle, techStack } = body;

        if (!candidateAnswer || typeof candidateAnswer !== "string" || candidateAnswer.trim().length < 5) {
            return NextResponse.json({
                hasFollowUp: true,
                followUpQuestion: "Could you elaborate on your response with a concrete example from your project work?",
                reason: "short_answer"
            });
        }

        const answerText = candidateAnswer.toLowerCase();
        const words = candidateAnswer.trim().split(/\s+/);

        // Check if candidate answer is very brief or vague
        if (words.length < 12) {
            return NextResponse.json({
                hasFollowUp: true,
                followUpQuestion: `You mentioned a brief summary regarding ${jobTitle || "this area"}. Can you walk me through a specific scenario from your project experience where you applied that?`,
                reason: "vague_answer"
            });
        }

        // Check for specific tech stack triggers in the answer
        if (answerText.includes("jwt") || answerText.includes("token") || answerText.includes("auth")) {
            return NextResponse.json({
                hasFollowUp: true,
                followUpQuestion: "You mentioned authentication. Walk me through step-by-step what happens from the moment a user submits credentials until they access a protected endpoint.",
                reason: "jwt_auth_deepdive"
            });
        }

        if (answerText.includes("spring") || answerText.includes("dependency injection") || answerText.includes("ioc")) {
            return NextResponse.json({
                hasFollowUp: true,
                followUpQuestion: "Since you brought up Spring, how did you structure your beans and handle dependency injection in your project? Why choose constructor injection over field injection?",
                reason: "spring_deepdive"
            });
        }

        if (answerText.includes("sql") || answerText.includes("query") || answerText.includes("index") || answerText.includes("postgres") || answerText.includes("database")) {
            return NextResponse.json({
                hasFollowUp: true,
                followUpQuestion: "You mentioned database queries. How did you verify query performance, and what indexing or optimization techniques did you apply?",
                reason: "database_deepdive"
            });
        }

        if (answerText.includes("microservice") || answerText.includes("api") || answerText.includes("rest") || answerText.includes("endpoint")) {
            return NextResponse.json({
                hasFollowUp: true,
                followUpQuestion: "You mentioned working with APIs. Where exactly did you use this endpoint architecture, and how did you handle rate limiting or error fallbacks?",
                reason: "api_deepdive"
            });
        }

        if (answerText.includes("state") || answerText.includes("redux") || answerText.includes("context") || answerText.includes("hook") || answerText.includes("react")) {
            return NextResponse.json({
                hasFollowUp: true,
                followUpQuestion: "You referenced frontend state management. How did you prevent unnecessary component re-renders when managing global state?",
                reason: "frontend_state_deepdive"
            });
        }

        // Default adaptive follow-up
        return NextResponse.json({
            hasFollowUp: true,
            followUpQuestion: `Interesting point. Where exactly in your project did you implement that, and what was the main technical trade-off you had to consider?`,
            reason: "adaptive_general"
        });

    } catch (error: any) {
        console.error("Follow-up generation error:", error);
        return NextResponse.json({
            hasFollowUp: false,
            followUpQuestion: null
        }, { status: 500 });
    }
}
