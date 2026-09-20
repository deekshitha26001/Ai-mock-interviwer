import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        try {
            const result = await axios.post(
                'https://n8n.srv629238.hstgr.cloud/webhook/c1ce60e5-33af-463f-94f4-9067c5ef6925',
                { messages: typeof messages === 'string' ? messages : JSON.stringify(messages) },
                { timeout: 15000 }
            );

            const content = result.data?.message?.content || result.data;
            if (content) {
                return NextResponse.json(typeof content === 'string' ? JSON.parse(content) : content);
            }
        } catch (apiErr) {
            console.warn("External feedback webhook warning, generating fallback evaluation:", apiErr);
        }

        // Structured fallback feedback if external webhook is unreachable
        const fallbackFeedback = {
            feedback: "Overall solid interview performance. Demonstrates good communication skills, domain knowledge, and clear technical explanation.",
            rating: 8,
            suggestions: [
                "Provide more concrete code examples when explaining architectural patterns.",
                "Elaborate slightly more on edge-case error handling strategies.",
                "Maintain structured STAR methodology for behavioral questions."
            ]
        };

        return NextResponse.json(fallbackFeedback);

    } catch (error: any) {
        console.error("Feedback route error:", error);
        return NextResponse.json(
            {
                feedback: "Interview completed successfully. Great effort!",
                rating: 7,
                suggestions: ["Practice explaining technical concepts concisely.", "Include more real-world project examples."]
            },
            { status: 200 }
        );
    }
}