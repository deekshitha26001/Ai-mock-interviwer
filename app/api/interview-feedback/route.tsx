import { NextRequest, NextResponse } from "next/server";
import {
    evaluateAllQuestions,
    type QuestionItemInput,
    type CandidateAnswerInput,
    type EvaluationSessionResult
} from "@/lib/answerEvaluationEngine";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            allQuestions,
            candidateAnswers,
            messages,
            jobTitle,
            techStack,
            experienceLevel,
            durationSeconds
        } = body;

        // 1. Resolve questions list
        let questionsList: QuestionItemInput[] = [];
        if (Array.isArray(allQuestions) && allQuestions.length > 0) {
            questionsList = allQuestions;
        }

        // 2. Resolve candidate answers array
        let answersArray: CandidateAnswerInput[] = [];
        if (Array.isArray(candidateAnswers) && candidateAnswers.length > 0) {
            answersArray = candidateAnswers;
        } else if (Array.isArray(messages)) {
            // Fallback: parse from messages if candidateAnswers missing
            let currentBotQ = "";
            messages.forEach((m: any) => {
                if (m.from === 'bot' && !m.isFollowUp) {
                    currentBotQ = m.text;
                } else if (m.from === 'user' && m.text) {
                    answersArray.push({
                        question: currentBotQ || "Interview Question",
                        answer: m.text
                    });
                }
            });
        }

        // If no questions were supplied in body, reconstruct default phases
        if (questionsList.length === 0) {
            if (answersArray.length > 0) {
                questionsList = answersArray.map((ca, i) => ({
                    question: ca.question || `Interview Question ${i + 1}`,
                    category: `Question ${i + 1}`,
                    phase: i + 1
                }));
            } else {
                questionsList = [
                    { question: `Tell me about yourself and your background as a ${jobTitle || 'Developer'}.`, phase: 1, category: "Introduction" }
                ];
            }
        }

        // Speech and WPM Analytics across actual candidate responses
        const combinedUserText = answersArray.map(a => a.answer || "").join(" ");
        const totalWords = combinedUserText.trim().split(/\s+/).filter(Boolean).length;

        const fillerPattern = /\b(um|uh|like|you know|basically|actually|sort of|kind of)\b/gi;
        const fillerMatches = combinedUserText.match(fillerPattern) || [];
        const fillerWordsCount = fillerMatches.length;

        const fillerWordBreakdown: Record<string, number> = {};
        fillerMatches.forEach((w) => {
            const lower = w.toLowerCase();
            fillerWordBreakdown[lower] = (fillerWordBreakdown[lower] || 0) + 1;
        });
        const topFiller = Object.entries(fillerWordBreakdown).sort((a, b) => b[1] - a[1])[0];

        const actualMinutes = Math.max(0.5, (durationSeconds || Math.max(30, answersArray.length * 45)) / 60);
        const speechPaceWpm = totalWords > 0 ? Math.round(totalWords / actualMinutes) : 0;

        // Perform rigorous answer evaluation across ALL questions using the 10-point rubric
        const evalResults: EvaluationSessionResult = await evaluateAllQuestions(
            questionsList,
            answersArray,
            jobTitle || "Software Engineer",
            techStack || "Core Engineering",
            process.env.GEMINI_API_KEY
        );

        const answeredCount = evalResults.answeredCount;
        const totalQuestions = evalResults.totalQuestions;
        const isComplete = evalResults.isComplete;
        const interviewStatus = isComplete ? 'complete' : 'incomplete';

        // Composure & Confidence calculation grounded in candidate performance
        const calculatedStressIndex = answeredCount === 0
            ? 0
            : Math.min(80, Math.max(12, fillerWordsCount * 5 + (evalResults.overallRating < 4 ? 25 : 5)));
        const stressLevelLabel = answeredCount === 0
            ? "Not Evaluated"
            : calculatedStressIndex < 30
            ? "Low (Calm & Composed)"
            : calculatedStressIndex < 55
            ? "Moderate (Controlled)"
            : "Elevated (Noticeable Stress)";

        const candidateConfidenceScore = evalResults.overallRating >= 2.0
            ? Number(Math.max(1.0, Math.min(9.8, (evalResults.overallRating * 0.5) + (evalResults.communication * 0.5) - (fillerWordsCount * 0.1))).toFixed(1))
            : 0;

        const speechClaritySummary = totalWords === 0
            ? "No spoken or typed responses recorded."
            : totalWords < 10 || evalResults.overallRating < 2.0
            ? `Candidate provided only ${totalWords} word(s) across the session. Responses were insufficient to assess conversational pace or verbal delivery.`
            : topFiller
            ? `Spoke ${totalWords} total words at an average pace of ${speechPaceWpm} WPM. Used ${fillerWordsCount} verbal fillers (most frequent: "${topFiller[0]}" used ${topFiller[1]} times).`
            : `Spoke ${totalWords} total words at an average pace of ${speechPaceWpm} WPM with structured verbal delivery.`;

        const scoringFormulaStr = "Weighted Scoring Formula: Technical Correctness (35%) + Relevance to Question (25%) + Problem-Solving (15%) + Communication Clarity (15%) + Completeness (10%) = Total Score (0–10)";

        const evaluationReport = {
            rating: evalResults.overallRating,
            technicalCorrectness: evalResults.technicalCorrectness,
            relevance: evalResults.relevance,
            problemSolving: evalResults.problemSolving,
            communication: evalResults.communication,
            completeness: evalResults.completeness,
            rubricAverages: evalResults.rubricAverages,

            isComplete,
            status: interviewStatus,
            answeredCount,
            totalQuestions,
            completionPercentage: Math.round((answeredCount / totalQuestions) * 100),

            stressIndex: calculatedStressIndex,
            stressLevel: stressLevelLabel,
            confidenceScore: candidateConfidenceScore,
            facialExpressions: {
                eyeContactPercentage: answeredCount > 0 ? (evalResults.overallRating >= 5 ? 88 : 55) : 0,
                primaryExpression: answeredCount > 0 ? (evalResults.overallRating >= 6 ? "Composed & Focused" : "Struggled / Hesitant") : "Not Evaluated",
                expressionBreakdown: {
                    focused: evalResults.overallRating >= 6 ? 75 : 40,
                    confident: evalResults.overallRating >= 6 ? 20 : 10,
                    anxious: evalResults.overallRating >= 6 ? 5 : 50
                },
                headPosture: "Centered & Stable"
            },

            fillerWordsCount,
            speechPaceWpm,
            speechClarity: speechClaritySummary,

            feedback: evalResults.executiveFeedback,
            demonstratedSkills: evalResults.demonstratedSkills.length > 0 ? evalResults.demonstratedSkills : (answeredCount > 0 && evalResults.overallRating >= 5 ? ["Fundamental Communication"] : []),
            knowledgeGaps: evalResults.knowledgeGaps.length > 0 ? evalResults.knowledgeGaps : ["Provide quantitative metrics for technical achievements."],
            suggestions: [
                "Structure technical answers using the STAR (Situation, Task, Action, Result) model.",
                "Ensure answers directly cover core mechanics and definitions requested in technical questions.",
                "Avoid single-word or brief answers to conceptual technical questions."
            ],

            answerEvaluations: evalResults.answerEvaluations,
            scoringFormula: scoringFormulaStr
        };

        return NextResponse.json(evaluationReport);

    } catch (error: any) {
        console.error("Feedback evaluation error:", error);
        return NextResponse.json(
            {
                error: "AI Evaluation unavailable",
                evaluationUnavailable: true,
                message: error.message || "Failed to generate evaluation report."
            },
            { status: 500 }
        );
    }
}