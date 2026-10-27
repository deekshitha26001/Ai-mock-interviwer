import axios from "axios";

export interface QuestionItemInput {
    question: string;
    answer?: string;
    category?: string;
    phase?: number;
    difficulty?: string;
}

export interface CandidateAnswerInput {
    question?: string;
    answer?: string;
    timestampSeconds?: number;
    questionIndex?: number;
}

export type ScoreBand =
    | "Empty / Irrelevant"
    | "Mostly Incorrect"
    | "Partially Correct"
    | "Moderately Good"
    | "Strong"
    | "Exceptional";

export interface IndividualAnswerEvaluation {
    questionIndex: number;
    question: string;
    userAnswer: string;
    wordCount: number;
    isAnswered: boolean;
    technicalScore: number;      // 0 to 4 pts (Technical correctness)
    relevanceScore: number;      // 0 to 2 pts (Relevance to question)
    completenessScore: number;   // 0 to 2 pts (Completeness)
    clarityScore: number;        // 0 to 2 pts (Explanation and clarity)
    problemSolvingScore: number; // 0 to 10 scale (for radar chart)
    communicationScore: number;  // 0 to 10 scale (for radar chart)
    questionScore: number;       // 0 to 10 pts (Sum of 4 criteria)
    scoreBand: ScoreBand;
    doneWell: string[];
    missingConcepts: string[];
    evidenceQuote: string;
    improvementSuggestion: string;
    betterStarAnswer: string;
}

export interface EvaluationSessionResult {
    answerEvaluations: IndividualAnswerEvaluation[];
    answeredCount: number;
    totalQuestions: number;
    isComplete: boolean;
    overallRating: number;         // 0 to 10 (Rubric-grounded average)
    technicalCorrectness: number;  // 0 to 10 (Normalized)
    relevance: number;             // 0 to 10 (Normalized)
    completeness: number;          // 0 to 10 (Normalized)
    communication: number;         // 0 to 10 (Normalized)
    problemSolving: number;        // 0 to 10 (Normalized)
    rubricAverages: {
        technical: number;         // 0 to 4 pts
        relevance: number;         // 0 to 2 pts
        completeness: number;      // 0 to 2 pts
        clarity: number;           // 0 to 2 pts
    };
    demonstratedSkills: string[];
    knowledgeGaps: string[];
    executiveFeedback: string;
}

const COMMON_STOPWORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further",
    "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his",
    "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than",
    "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this",
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what",
    "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours",
    "yourself", "yourselves", "tell", "briefly", "give", "please", "can", "welcome", "let's", "lets",
    "discuss", "start", "cover", "begin", "talk", "good", "nice", "great"
]);

function cleanText(text: string): string {
    return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function stemWord(w: string): string {
    if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
    if (w.endsWith("tion") && w.length > 6) return w.slice(0, -4);
    if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
    if (w.endsWith("s") && w.length > 3) return w.slice(0, -1);
    if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
    return w;
}

export function isGenuineYesNoQuestion(q: string): { isYesNo: boolean; requiresJustification: boolean } {
    const qLower = (q || "").toLowerCase().trim();
    const nonBinaryKeywords = [
        "explain", "what is", "what are", "how does", "how do", "how would", "why",
        "describe", "compare", "tell me", "walk me through", "differentiate",
        "define", "list", "name the", "which are", "difference", "implement",
        "write", "solve", "reverse", "design", "approach", "handle", "optimize",
        "introduce", "background", "experience", "give an example", "give examples",
        "can you", "could you", "would you", "tell us", "discuss", "summarize",
        "pillar", "pillars", "solid", "rest", "sql", "pattern", "patterns"
    ];
    if (nonBinaryKeywords.some(kw => qLower.includes(kw))) {
        return { isYesNo: false, requiresJustification: true };
    }
    const strictBinaryStarters = ["is it", "is there", "is java", "is python", "is http", "does a", "are there"];
    const isStrictBinary = strictBinaryStarters.some(s => qLower.startsWith(s));
    return {
        isYesNo: isStrictBinary,
        requiresJustification: true
    };
}

export const CONVERSATIONAL_NON_ANSWERS = new Set([
    "ok", "okay", "k", "fine", "sure", "alright", "got it", "understood",
    "cool", "yup", "yeah", "yep", "hi", "hello", "hey", "test", "testing",
    "none", "nothing", "good", "nice", "great", "thanks", "thank you",
    "bye", "goodbye", "idk", "pass", "skip", "next", "i agree", "ok sure",
    "yes ok", "ok fine", "yes sure", "yeah ok", "yes sir", "no sir", "yah"
]);

export function extractKeyConcepts(expectedAnswer: string, qText: string): string[] {
    const concepts: string[] = [];
    if (!expectedAnswer) return concepts;

    const rawChunks = expectedAnswer.split(/[,;:.()]+/).map(s => s.trim()).filter(Boolean);
    for (const chunk of rawChunks) {
        const cleanChunk = cleanText(chunk);
        const words = cleanChunk.split(" ").filter(w => !COMMON_STOPWORDS.has(w) && w.length > 2);
        if (words.length > 0) {
            if (words.length <= 4) {
                concepts.push(words.join(" "));
            }
            for (const word of words) {
                concepts.push(word);
            }
        }
    }

    return Array.from(new Set(concepts));
}

export function getScoreBand(score: number): ScoreBand {
    if (score <= 1.0) return "Empty / Irrelevant";
    if (score <= 3.0) return "Mostly Incorrect";
    if (score <= 5.0) return "Partially Correct";
    if (score <= 7.0) return "Moderately Good";
    if (score <= 9.0) return "Strong";
    return "Exceptional";
}

/**
 * Backward compatibility helper for 5-metric weighting
 */
export function calculateWeightedScore(
    tech: number,
    relevance: number,
    problemSolving: number,
    comm: number,
    completeness: number
): number {
    const raw = (tech * 0.35) + (relevance * 0.25) + (problemSolving * 0.15) + (comm * 0.15) + (completeness * 0.10);
    const bounded = Math.max(0, Math.min(10, raw));
    return Number(bounded.toFixed(1));
}

/**
 * Evaluates a single answer strictly adhering to the 10-point rubric:
 * - Technical correctness: 0–4 points
 * - Relevance to question: 0–2 points
 * - Completeness: 0–2 points
 * - Explanation and clarity: 0–2 points
 */
export function evaluateSingleAnswer(
    qItem: QuestionItemInput,
    candidateAnswer: string,
    questionIndex: number = 1,
    cleanJob: string = "Software Engineer",
    cleanStack: string = "General Stack"
): IndividualAnswerEvaluation {
    const qText = qItem.question || `Interview Question ${questionIndex}`;
    const expectedConcepts = qItem.answer || "";
    const category = qItem.category || `Phase ${questionIndex}`;
    const rawAnswer = (candidateAnswer || "").trim();
    const words = rawAnswer.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const answerLower = rawAnswer.toLowerCase();
    const cleanedAnswer = cleanText(rawAnswer);

    const starModel = expectedConcepts
        ? `SITUATION: Working as a ${cleanJob} on production systems.\nTASK: Address ${qText.substring(0, 60)}...\nACTION: ${expectedConcepts}.\nRESULT: Verified clean architecture, modularity, and high runtime performance.`
        : `SITUATION: Implementing mission-critical services as a ${cleanJob}.\nTASK: Deliver a robust, maintainable solution for ${qText.substring(0, 50)}...\nACTION: Applied standard software patterns and comprehensive unit tests.\nRESULT: Maintained 99.9% uptime with zero critical regressions.`;

    const evidenceQuote = rawAnswer.length > 120
        ? `"${rawAnswer.substring(0, 120)}..."`
        : rawAnswer.length > 0
        ? `"${rawAnswer}"`
        : "No answer provided.";

    // 1. UNANSWERED CASE
    if (wordCount === 0) {
        return {
            questionIndex,
            question: qText,
            userAnswer: "Not answered",
            wordCount: 0,
            isAnswered: false,
            technicalScore: 0,
            relevanceScore: 0,
            completenessScore: 0,
            clarityScore: 0,
            problemSolvingScore: 0,
            communicationScore: 0,
            questionScore: 0,
            scoreBand: "Empty / Irrelevant",
            doneWell: [],
            missingConcepts: ["Question was left unanswered during the interview session."],
            evidenceQuote,
            improvementSuggestion: `Prepare a structured answer covering expected concepts: "${expectedConcepts || 'Key architectural patterns'}".`,
            betterStarAnswer: starModel
        };
    }

    // 2. CHECK CONVERSATIONAL NON-ANSWERS ("ok", "okay", "sure", "fine", "cool", "hi", "test", etc.)
    const isConversationalFiller = CONVERSATIONAL_NON_ANSWERS.has(cleanedAnswer) ||
        CONVERSATIONAL_NON_ANSWERS.has(answerLower) ||
        (wordCount <= 2 && ["ok", "okay", "fine", "sure", "hello", "hi", "test"].some(w => answerLower.split(/\s+/).includes(w)));

    if (isConversationalFiller) {
        return {
            questionIndex,
            question: qText,
            userAnswer: rawAnswer,
            wordCount,
            isAnswered: true,
            technicalScore: 0,
            relevanceScore: 0,
            completenessScore: 0,
            clarityScore: 0,
            problemSolvingScore: 0,
            communicationScore: 0,
            questionScore: 0,
            scoreBand: "Empty / Irrelevant",
            doneWell: [],
            missingConcepts: [
                `Response ("${rawAnswer}") is a conversational acknowledgment and does not address the question.`,
                "Zero technical concepts, explanations, or reasoning provided."
            ],
            evidenceQuote,
            improvementSuggestion: `Avoid conversational fillers like "${rawAnswer}". In technical interviews, provide structured explanations covering principles, architecture, and examples.`,
            betterStarAnswer: starModel
        };
    }

    // 3. CHECK REFUSAL / IDK CASE
    const refusalPhrases = [
        "i don't know", "dont know", "no idea", "not sure", "no clue",
        "haven't used", "have not used", "skip", "pass", "next question",
        "i cannot answer", "no answer", "idk", "not familiar", "cannot recall",
        "don't remember", "no comment"
    ];
    const isRefusal = refusalPhrases.some(phrase => answerLower.includes(phrase));
    if (isRefusal) {
        return {
            questionIndex,
            question: qText,
            userAnswer: rawAnswer,
            wordCount,
            isAnswered: true,
            technicalScore: 0,
            relevanceScore: 0.2, // 1.0 out of 10 for direct acknowledgment
            completenessScore: 0,
            clarityScore: 0.2,   // 1.0 out of 10 for basic verbal acknowledgment
            problemSolvingScore: 0,
            communicationScore: 1.0,
            questionScore: 0.4,
            scoreBand: "Empty / Irrelevant",
            doneWell: [],
            missingConcepts: ["Candidate explicitly stated unfamiliarity or declined to answer this topic."],
            evidenceQuote,
            improvementSuggestion: `Study the expected concepts: "${expectedConcepts || 'Key architectural patterns'}".`,
            betterStarAnswer: starModel
        };
    }

    // 4. CHECK SINGLE-WORD "YES" / "NO"
    const isSingleYesOrNo = answerLower === "yes" || answerLower === "no" || answerLower === "yeah" || answerLower === "nope";
    if (isSingleYesOrNo) {
        const yesNoAnalysis = isGenuineYesNoQuestion(qText);
        if (!yesNoAnalysis.isYesNo) {
            // One-word answer to technical question -> 0 score
            return {
                questionIndex,
                question: qText,
                userAnswer: rawAnswer,
                wordCount,
                isAnswered: true,
                technicalScore: 0,
                relevanceScore: 0,
                completenessScore: 0,
                clarityScore: 0,
                problemSolvingScore: 0,
                communicationScore: 0,
                questionScore: 0,
                scoreBand: "Empty / Irrelevant",
                doneWell: [],
                missingConcepts: [
                    `Single-word response ("${rawAnswer}") does not address this technical question.`,
                    "Failed to provide necessary technical definitions, mechanics, or reasoning."
                ],
                evidenceQuote,
                improvementSuggestion: "A technical interview question requires explaining principles, architecture, and concrete examples. Single-word answers receive zero marks.",
                betterStarAnswer: starModel
            };
        } else {
            // Rare strict binary question (e.g. "Is HTTP stateless?")
            const expectedLower = expectedConcepts.toLowerCase();
            const expectedYes = expectedLower.includes("yes") || expectedLower.includes("true");
            const candidateYes = answerLower.includes("yes") || answerLower.includes("yeah");
            const isBinaryCorrect = (expectedYes && candidateYes) || (!expectedYes && !candidateYes);

            if (isBinaryCorrect) {
                // Correct binary guess, but zero justification provided
                return {
                    questionIndex,
                    question: qText,
                    userAnswer: rawAnswer,
                    wordCount,
                    isAnswered: true,
                    technicalScore: 1.0,      // 2.5/10 (binary premise only, zero mechanics)
                    relevanceScore: 1.0,      // 5.0/10
                    completenessScore: 0.3,   // 1.5/10 (severely incomplete without explanation)
                    clarityScore: 0.5,        // 2.5/10
                    problemSolvingScore: 0.5, // 0.5/10 (no reasoning shown)
                    communicationScore: 1.5,  // 1.5/10 (one word)
                    questionScore: 2.6,
                    scoreBand: "Mostly Incorrect",
                    doneWell: ["Correctly identified the binary (Yes/No) premise."],
                    missingConcepts: ["Omitted all required technical justification, underlying mechanics, and architectural principles."],
                    evidenceQuote,
                    improvementSuggestion: "Always provide technical justification explaining why when answering architectural questions.",
                    betterStarAnswer: starModel
                };
            } else {
                // Incorrect binary guess
                return {
                    questionIndex,
                    question: qText,
                    userAnswer: rawAnswer,
                    wordCount,
                    isAnswered: true,
                    technicalScore: 0,
                    relevanceScore: 0.2,
                    completenessScore: 0,
                    clarityScore: 0.2,
                    problemSolvingScore: 0,
                    communicationScore: 0.5,
                    questionScore: 0.3,
                    scoreBand: "Empty / Irrelevant",
                    doneWell: [],
                    missingConcepts: ["Incorrect binary answer. Re-examine core framework documentation."],
                    evidenceQuote,
                    improvementSuggestion: `Review the correct behavior: "${expectedConcepts}".`,
                    betterStarAnswer: starModel
                };
            }
        }
    }

    // 4. CHECK IF INTRODUCTION QUESTION (Phase 1)
    const isIntroQuestion = category.toLowerCase().includes("introduction") ||
        qText.toLowerCase().includes("tell me about yourself") ||
        qText.toLowerCase().includes("summarize your background");

    if (isIntroQuestion) {
        const cleanedIntro = cleanText(rawAnswer);

        const hasRoleTitle = ["developer", "engineer", "scientist", "analyst", "architect", "programmer"].some(r => cleanedIntro.includes(r));
        const hasExperience = ["year", "years", "experience", "background", "working", "worked"].some(e => cleanedIntro.includes(e));

        const techStackTerms = cleanStack.split(/[,;\s]+/).filter(w => w.length > 2).map(w => cleanText(w));
        const generalTechnologies = [
            "react", "next", "vue", "angular", "node", "typescript", "javascript", "java", "python",
            "sql", "postgres", "mysql", "mongodb", "docker", "kubernetes", "aws", "cloud", "api", "rest",
            "spring", "django", "flask", "fastapi", "git", "ci/cd", "graphql", "microservices"
        ];
        const combinedTechList = Array.from(new Set([...techStackTerms, ...generalTechnologies]));
        const mentionedTech = combinedTechList.filter(tech => cleanedIntro.includes(tech));

        const projectActionVerbs = ["built", "developed", "designed", "optimized", "implemented", "managed", "deployed", "scaled", "created", "architected"];
        const mentionedActions = projectActionVerbs.filter(act => cleanedIntro.includes(act));

        const introPillarsCovered = [
            hasRoleTitle || hasExperience,
            mentionedTech.length >= 2,
            mentionedActions.length >= 1
        ].filter(Boolean).length;

        if (introPillarsCovered === 0) {
            return {
                questionIndex,
                question: qText,
                userAnswer: rawAnswer,
                wordCount,
                isAnswered: true,
                technicalScore: 0,
                relevanceScore: 0.5,
                completenessScore: 0,
                clarityScore: 0.5,
                problemSolvingScore: 0,
                communicationScore: 2.5,
                questionScore: 1.0,
                scoreBand: "Empty / Irrelevant",
                doneWell: [],
                missingConcepts: ["Did not mention professional role, core tech stack, or relevant project experience."],
                evidenceQuote,
                improvementSuggestion: "Structure your introduction with: 1) Current role & years of experience, 2) Primary technical stack, 3) Key project achievement.",
                betterStarAnswer: starModel
            };
        }

        let technicalScore = 0;
        let completenessScore = 0;
        const relevanceScore = 2.0;
        const clarityScore = wordCount >= 25 ? 1.8 : 1.4;

        if (introPillarsCovered === 3) {
            technicalScore = mentionedTech.length >= 3 ? 4.0 : 3.6;
            completenessScore = 2.0;
        } else if (introPillarsCovered === 2) {
            technicalScore = 2.8;
            completenessScore = 1.3;
        } else {
            technicalScore = 1.8;
            completenessScore = 0.8;
        }

        const questionScore = Number((technicalScore + relevanceScore + completenessScore + clarityScore).toFixed(1));
        const scoreBand = getScoreBand(questionScore);

        const doneWell: string[] = [];
        if (hasRoleTitle || hasExperience) doneWell.push("Clear professional positioning and experience overview.");
        if (mentionedTech.length > 0) doneWell.push(`Highlighted core stack technologies: ${mentionedTech.slice(0, 4).join(", ")}.`);
        if (mentionedActions.length > 0) doneWell.push(`Demonstrated project impact: ${mentionedActions.slice(0, 3).join(", ")}.`);

        return {
            questionIndex,
            question: qText,
            userAnswer: rawAnswer,
            wordCount,
            isAnswered: true,
            technicalScore: Number(technicalScore.toFixed(1)),
            relevanceScore: Number(relevanceScore.toFixed(1)),
            completenessScore: Number(completenessScore.toFixed(1)),
            clarityScore: Number(clarityScore.toFixed(1)),
            problemSolvingScore: Number(((technicalScore / 4) * 10).toFixed(1)),
            communicationScore: Number(((clarityScore / 2) * 10).toFixed(1)),
            questionScore,
            scoreBand,
            doneWell,
            missingConcepts: introPillarsCovered < 3 ? ["Include specific metrics or benchmarks from your recent projects."] : [],
            evidenceQuote,
            improvementSuggestion: "Ensure you mention specific technical impact (e.g. latency reduced, users supported) in your introduction.",
            betterStarAnswer: starModel
        };
    }

    // 5. EXTRACT EXPECTED CONCEPTS & ANALYZE SEMANTIC OVERLAP
    const keyConcepts = extractKeyConcepts(expectedConcepts, qText);
    const cleanedAnswer = cleanText(rawAnswer);
    const answerTokens = new Set(cleanedAnswer.split(" ").map(w => stemWord(w)));

    const matchedConcepts: string[] = [];
    const missingConcepts: string[] = [];

    const primaryConcepts = keyConcepts.filter(c => c.includes(" ") || c.length > 4);
    const conceptPool = primaryConcepts.length > 0 ? primaryConcepts : keyConcepts;

    for (const concept of conceptPool) {
        const cleanConcept = cleanText(concept);
        const conceptWords = cleanConcept.split(" ").map(w => stemWord(w));
        const allWordsMatched = conceptWords.every(cw => answerTokens.has(cw) || cleanedAnswer.includes(cw));
        if (allWordsMatched || cleanedAnswer.includes(cleanConcept)) {
            matchedConcepts.push(concept);
        } else {
            missingConcepts.push(concept);
        }
    }

    const generalTechKeywords = [
        "algorithm", "array", "database", "sql", "api", "rest", "class", "object", "interface",
        "function", "component", "thread", "memory", "server", "client", "docker", "container",
        "pipeline", "test", "variable", "scope", "state", "hook", "query", "index", "model",
        "loss", "validation", "parameter", "inheritance", "polymorphism", "encapsulation",
        "abstraction", "overload", "override", "virtual", "kernel", "table", "schema", "cluster",
        "where", "having", "group by", "aggregation", "filter"
    ];
    const techWordsInAnswer = generalTechKeywords.filter(kw => answerTokens.has(stemWord(kw)) || cleanedAnswer.includes(kw));

    // 6. DETECT COMPLETELY IRRELEVANT / OFF-TOPIC ANSWERS
    const totalExpected = Math.max(1, conceptPool.length);
    const matchRatio = matchedConcepts.length / totalExpected;

    if (matchRatio === 0 && techWordsInAnswer.length === 0) {
        return {
            questionIndex,
            question: qText,
            userAnswer: rawAnswer,
            wordCount,
            isAnswered: true,
            technicalScore: 0,
            relevanceScore: 0,
            completenessScore: 0,
            clarityScore: 0,
            problemSolvingScore: 0,
            communicationScore: 0,
            questionScore: 0,
            scoreBand: "Empty / Irrelevant",
            doneWell: [],
            missingConcepts: [
                "Answer is completely irrelevant to the interview question.",
                "Zero technical concepts or relevant domain terminology provided."
            ],
            evidenceQuote,
            improvementSuggestion: "Stay strictly focused on the technical requirements of the interview question.",
            betterStarAnswer: starModel
        };
    }

    // 7. CHECK VERY SHORT ANSWERS (< 6 words) THAT LACK SUBSTANCE
    if (wordCount < 6) {
        if (matchedConcepts.length === 0) {
            return {
                questionIndex,
                question: qText,
                userAnswer: rawAnswer,
                wordCount,
                isAnswered: true,
                technicalScore: 0,
                relevanceScore: 0,
                completenessScore: 0,
                clarityScore: 0,
                problemSolvingScore: 0,
                communicationScore: 0,
                questionScore: 0,
                scoreBand: "Empty / Irrelevant",
                doneWell: [],
                missingConcepts: [
                    `Answer is too short (${wordCount} words) to evaluate and contains no relevant technical concepts.`,
                    "Failed to provide required definitions, mechanics, or code logic."
                ],
                evidenceQuote,
                improvementSuggestion: "Provide a complete, structured answer explaining the underlying principles, how they work, and a real-world project example.",
                betterStarAnswer: starModel
            };
        } else {
            // Named keyword(s) but provided no explanation or mechanics
            const techNorm = 2.0;
            const relNorm = 4.0;
            const problemSolvingScore = 1.0;
            const communicationScore = 2.0;
            const compNorm = 1.5;
            const questionScore = calculateWeightedScore(techNorm, relNorm, problemSolvingScore, communicationScore, compNorm);
            return {
                questionIndex,
                question: qText,
                userAnswer: rawAnswer,
                wordCount,
                isAnswered: true,
                technicalScore: 0.8,
                relevanceScore: 0.8,
                completenessScore: 0.3,
                clarityScore: 0.5,
                problemSolvingScore,
                communicationScore,
                questionScore,
                scoreBand: "Mostly Incorrect",
                doneWell: [`Mentioned expected technical term (${matchedConcepts[0]}).`],
                missingConcepts: [
                    `Answer is too brief (${wordCount} words) to evaluate in depth.`,
                    "Omitted technical definitions, implementation mechanics, and concrete examples."
                ],
                evidenceQuote,
                improvementSuggestion: "Expand your answer with clear definitions, how the technology functions, and specific project examples.",
                betterStarAnswer: starModel
            };
        }
    }

    // 8. DETECT INCORRECT / CONTRADICTION ANSWERS
    let hasSevereContradiction = false;
    let contradictionReason = "";

    if (/\bwhere\b[a-z\s]{1,30}\bafter\s+group\s+by\b/i.test(rawAnswer)) {
        hasSevereContradiction = true;
        contradictionReason = "Stated that WHERE filters after GROUP BY (WHERE filters before GROUP BY).";
    }
    if (qText.toLowerCase().includes("polymorphism")) {
        if (cleanedAnswer.includes("database") && !cleanedAnswer.includes("form") && !cleanedAnswer.includes("overload") && !cleanedAnswer.includes("override")) {
            hasSevereContradiction = true;
            contradictionReason = "Confused polymorphism with database operations.";
        }
    }
    if (/\bvar\b[a-z\s]{1,20}\bblock\s+scoped\b/i.test(rawAnswer) || /\blet\b[a-z\s]{1,20}\bfunction\s+scoped\b/i.test(rawAnswer)) {
        hasSevereContradiction = true;
        contradictionReason = "Reversed scoping rules for let and var.";
    }

    const explanatoryVerbs = [
        "bundles", "restricts", "hiding", "hides", "allows", "replaces",
        "overloading", "overriding", "multiple forms", "essential", "interface", "details",
        "filters", "caches", "before", "after", "allocates", "shares", "kernel", "virtualize",
        "swapping", "pointer", "time complexity", "space complexity", "underfitting", "overfitting",
        "access modifiers", "subclasses", "compile time", "runtime", "groups", "rows"
    ];

    let definedConceptsCount = 0;
    matchedConcepts.forEach(c => {
        const cClean = cleanText(c);
        let pos = 0;
        let isElaborated = false;
        while (true) {
            const idx = cleanedAnswer.indexOf(cClean, pos);
            if (idx === -1) break;
            pos = idx + cClean.length;
            const following = cleanedAnswer.substring(pos, pos + 80).trim();
            const nextConcept = conceptPool.find(other => other !== c && (following.startsWith(cleanText(other)) || following.startsWith("and " + cleanText(other))));
            if (nextConcept) {
                continue;
            }
            if (explanatoryVerbs.some(verb => following.includes(verb))) {
                isElaborated = true;
                break;
            }
        }
        if (isElaborated) {
            definedConceptsCount++;
        }
    });

    const isDifferenceQuestion = qText.toLowerCase().includes("difference between") || qText.toLowerCase().includes("compare");
    const asksForDefinitions = qText.toLowerCase().includes("define") || qText.toLowerCase().includes("explain");

    let definitionRatio = 0;
    if (isDifferenceQuestion) {
        if (cleanedAnswer.includes("before") && cleanedAnswer.includes("after") && cleanedAnswer.includes("where") && cleanedAnswer.includes("having")) {
            definitionRatio = 1.0;
        } else if (cleanedAnswer.includes("where") && cleanedAnswer.includes("having")) {
            definitionRatio = 0.5;
        }
    } else {
        definitionRatio = matchedConcepts.length > 0 ? (definedConceptsCount / matchedConcepts.length) : 0;
    }

    // 9. COMPUTE RUBRIC METRICS
    let technicalScore = 0;
    let relevanceScore = 0;
    let completenessScore = 0;
    let clarityScore = 0;
    const doneWell: string[] = [];

    if (hasSevereContradiction) {
        technicalScore = 0.5;
        relevanceScore = 0.8;
        completenessScore = 0.3;
        clarityScore = 0.8;
        missingConcepts.push(contradictionReason);
    } else if (matchRatio === 0) {
        technicalScore = 0.8;
        relevanceScore = 0.8;
        completenessScore = 0.4;
        clarityScore = 0.8;
        missingConcepts.push("Did not address the specific technical concepts requested.");
    } else {
        if (matchRatio >= 0.75) {
            if (asksForDefinitions && definitionRatio <= 0.25) {
                technicalScore = 2.2;
                relevanceScore = 1.6;
                completenessScore = 1.0;
                clarityScore = 1.0;
                missingConcepts.push("Listed expected concepts but omitted requested definitions.");
            } else if (asksForDefinitions && definitionRatio <= 0.6) {
                technicalScore = 2.8;
                relevanceScore = 1.8;
                completenessScore = 1.2;
                clarityScore = 1.2;
                missingConcepts.push("Provided definitions for only some of the concepts.");
            } else {
                technicalScore = (matchRatio >= 0.9 && definitionRatio >= 0.8) ? 4.0 : 3.6;
                relevanceScore = 2.0;
                completenessScore = 2.0;
                clarityScore = 1.8;
            }
        } else if (matchRatio >= 0.4) {
            if (asksForDefinitions && definitionRatio <= 0.25) {
                technicalScore = 1.8;
                relevanceScore = 1.4;
                completenessScore = 0.8;
                clarityScore = 0.8;
                missingConcepts.push("Only named a portion of concepts and omitted requested definitions.");
            } else {
                technicalScore = 2.4;
                relevanceScore = 1.6;
                completenessScore = 1.0;
                clarityScore = 1.0;
            }
        } else {
            technicalScore = 1.0;
            relevanceScore = 1.0;
            completenessScore = 0.5;
            clarityScore = 0.7;
            missingConcepts.push("Missed majority of required technical concepts.");
        }

        if (matchedConcepts.length > 0) {
            doneWell.push(`Accurately addressed technical concepts: ${matchedConcepts.slice(0, 4).join(", ")}.`);
        }
    }

    // Conciseness Rule: Do not penalize candidates for being concise when the answer is correct and complete
    if ((matchRatio >= 0.75 || isDifferenceQuestion) && definitionRatio >= 0.7 && !hasSevereContradiction) {
        completenessScore = 2.0;
        clarityScore = Math.max(1.8, clarityScore);
        technicalScore = Math.max(3.6, technicalScore);
    }

    // 10. REASONING & PROBLEM-SOLVING MARKERS
    const reasoningMarkers = [
        "because", "therefore", "in order to", "so that", "trade-off", "tradeoff",
        "versus", "vs", "advantage", "disadvantage", "drawback", "benefit",
        "complexity", "time complexity", "space complexity", "o(n)", "o(1)", "o(log n)", "o(n^2)",
        "scales", "bottleneck", "edge case", "handling error", "try-catch", "fallback",
        "two-pointer", "divide and conquer", "dynamic programming", "recursively",
        "iteratively", "caching", "indexing", "thread-safe", "deadlock", "race condition",
        "atomicity", "acid", "normalized", "denormalized", "investigate", "profiling",
        "benchmark", "latency", "throughput", "concurrency", "optimize", "prevent"
    ];
    const reasoningMatches = reasoningMarkers.filter(m => cleanedAnswer.includes(m));
    const hasReasoning = reasoningMatches.length > 0;

    let problemSolvingScore = 0;
    if (technicalScore >= 3.0 && hasReasoning) {
        problemSolvingScore = Math.min(10.0, Number((((technicalScore / 4) * 8.5) + (reasoningMatches.length * 0.8)).toFixed(1)));
    } else if (technicalScore >= 2.0) {
        problemSolvingScore = Number(((technicalScore / 4) * (hasReasoning ? 8.0 : 6.5)).toFixed(1));
    } else if (technicalScore >= 1.0) {
        problemSolvingScore = Number(((technicalScore / 4) * 5.0).toFixed(1));
    } else {
        problemSolvingScore = 0;
    }

    // 11. COMMUNICATION CLARITY EVALUATION
    let communicationScore = 0;
    if (clarityScore <= 0.4) {
        communicationScore = 0;
    } else if (clarityScore <= 0.8) {
        communicationScore = 3.0;
    } else if (clarityScore <= 1.2) {
        communicationScore = 5.5;
    } else if (clarityScore <= 1.6) {
        communicationScore = 7.5;
    } else {
        communicationScore = wordCount >= 25 ? 9.5 : 8.5;
    }

    const techNorm = Number(((technicalScore / 4) * 10).toFixed(1));
    const relNorm = Number(((relevanceScore / 2) * 10).toFixed(1));
    const compNorm = Number(((completenessScore / 2) * 10).toFixed(1));

    const questionScore = calculateWeightedScore(
        techNorm,
        relNorm,
        problemSolvingScore,
        communicationScore,
        compNorm
    );
    const scoreBand = getScoreBand(questionScore);

    return {
        questionIndex,
        question: qText,
        userAnswer: rawAnswer,
        wordCount,
        isAnswered: true,
        technicalScore: Number(technicalScore.toFixed(1)),
        relevanceScore: Number(relevanceScore.toFixed(1)),
        completenessScore: Number(completenessScore.toFixed(1)),
        clarityScore: Number(clarityScore.toFixed(1)),
        problemSolvingScore,
        communicationScore,
        questionScore,
        scoreBand,
        doneWell: doneWell.length > 0 ? doneWell : ["Addressed the technical topic."],
        missingConcepts: missingConcepts.length > 0 ? missingConcepts.slice(0, 3) : ["Incorporate specific production trade-offs and performance metrics."],
        evidenceQuote,
        improvementSuggestion: "Structure answer using the STAR method (Situation, Task, Action, Result) with precise technical terminology.",
        betterStarAnswer: starModel
    };
}

/**
 * Optional Gemini LLM Evaluator with strict rubric enforcement
 */
async function evaluateSingleAnswerWithGemini(
    qItem: QuestionItemInput,
    rawAnswer: string,
    questionIndex: number,
    cleanJob: string,
    cleanStack: string,
    apiKey: string
): Promise<IndividualAnswerEvaluation | null> {
    try {
        const prompt = `You are a strict, objective, and expert technical interviewer evaluating candidate answers using a 10-point rubric.

Question (${qItem.category || 'Technical'}): "${qItem.question}"
Expected Technical Answer / Concepts: "${qItem.answer || ''}"
Candidate Spoken Answer: "${rawAnswer}"
Target Role: "${cleanJob}"
Target Stack: "${cleanStack}"

EVALUATION RUBRIC (Strict 10-Point Total):
1. Technical Correctness (0 to 4 points):
   - 0: Completely incorrect, meaningless, or irrelevant. Zero technical accuracy.
   - 1: Mostly incorrect or severely incomplete with only isolated fragments.
   - 2: Partially correct with basic awareness, but major technical gaps or misconceptions.
   - 3: Substantially correct; core mechanisms and principles are accurate with minor omissions.
   - 4: Fully correct, precise, accurate terminology, sound architecture and mechanics.
2. Relevance to Question (0 to 2 points):
   - 0: Off-topic, non-responsive, or talking about unrelated subjects.
   - 1: Tangentially related or answers only a small portion while drifting.
   - 2: Directly, specifically, and exclusively addresses what was asked.
3. Completeness (0 to 2 points):
   - 0: Empty or leaves all required parts unaddressed.
   - 1: Partially addresses some sub-questions while omitting others.
   - 2: Fully addresses all components of the prompt. Do not penalize for conciseness if complete.
4. Explanation and Clarity (0 to 2 points):
   - 0: Incoherent, empty, or single-word non-response.
   - 1: Understandable but disorganized or vague.
   - 2: Clear, well-structured, precise terminology.

CRITICAL CONSTRAINTS:
- A one-word answer like "Yes" or "No" to a technical question MUST receive 0 or 1 point unless it is a pure yes/no question.
- Completely irrelevant answers (e.g. food, sports, random chat) MUST receive 0 or 1 point total.
- Never assign average marks (like 5 or 6) just because an answer was submitted.
- Do NOT reward answer length or grammar when the technical content is incorrect.

Output strict JSON:
{
  "technicalScore": 0.0,
  "relevanceScore": 0.0,
  "completenessScore": 0.0,
  "clarityScore": 0.0,
  "doneWell": ["Specific accurate points mentioned"],
  "missingConcepts": ["Specific missing concepts or errors"],
  "improvementSuggestion": "Concrete guidance to improve"
}`;

        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            },
            { timeout: 7000 }
        );

        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;

        const parsed = JSON.parse(text);
        let tech = Math.max(0, Math.min(4, Number(parsed.technicalScore) || 0));
        let rel = Math.max(0, Math.min(2, Number(parsed.relevanceScore) || 0));
        let comp = Math.max(0, Math.min(2, Number(parsed.completenessScore) || 0));
        let clarity = Math.max(0, Math.min(2, Number(parsed.clarityScore) || 0));

        // Strict validation overrides against LLM hallucination
        const answerLower = rawAnswer.toLowerCase().trim();
        const cleaned = cleanText(rawAnswer);
        const words = answerLower.split(/\s+/).filter(Boolean);
        const yesNoCheck = isGenuineYesNoQuestion(qItem.question);

        if (CONVERSATIONAL_NON_ANSWERS.has(cleaned) || CONVERSATIONAL_NON_ANSWERS.has(answerLower)) {
            tech = 0; rel = 0; comp = 0; clarity = 0;
        } else if (words.length <= 1 && !yesNoCheck.isYesNo) {
            tech = 0; rel = 0; comp = 0; clarity = 0;
        } else if (tech === 0) {
            rel = Math.min(0.5, rel);
            comp = 0;
            clarity = Math.min(0.5, clarity);
        }

        const techNorm = Number(((tech / 4) * 10).toFixed(1));
        const relNorm = Number(((rel / 2) * 10).toFixed(1));
        const compNorm = Number(((comp / 2) * 10).toFixed(1));
        const problemSolvingScore = Number(((tech / 4) * 10).toFixed(1));
        const communicationScore = Number(((clarity / 2) * 10).toFixed(1));

        const totalScore = calculateWeightedScore(
            techNorm,
            relNorm,
            problemSolvingScore,
            communicationScore,
            compNorm
        );
        const band = getScoreBand(totalScore);

        const starModel = qItem.answer
            ? `SITUATION: Engineering high-availability solutions for ${cleanJob}.\nTASK: Address ${qItem.question.substring(0, 50)}...\nACTION: ${qItem.answer}.\nRESULT: Ensured zero critical regressions and optimized throughput.`
            : `SITUATION: Architecture implementation.\nTASK: Provide scalable solution.\nACTION: Decoupled service layer and wrote unit tests.\nRESULT: High reliability.`;

        return {
            questionIndex,
            question: qItem.question,
            userAnswer: rawAnswer,
            wordCount: words.length,
            isAnswered: true,
            technicalScore: Number(tech.toFixed(1)),
            relevanceScore: Number(rel.toFixed(1)),
            completenessScore: Number(comp.toFixed(1)),
            clarityScore: Number(clarity.toFixed(1)),
            problemSolvingScore,
            communicationScore,
            questionScore: totalScore,
            scoreBand: band,
            doneWell: Array.isArray(parsed.doneWell) && parsed.doneWell.length > 0 ? parsed.doneWell : ["Provided candidate response."],
            missingConcepts: Array.isArray(parsed.missingConcepts) && parsed.missingConcepts.length > 0 ? parsed.missingConcepts : ["Deepen specific framework mechanics."],
            evidenceQuote: rawAnswer.length > 100 ? `"${rawAnswer.substring(0, 100)}..."` : `"${rawAnswer}"`,
            improvementSuggestion: parsed.improvementSuggestion || "Structure answer with STAR format.",
            betterStarAnswer: starModel
        };
    } catch {
        return null;
    }
}

/**
 * Evaluates all interview questions across the session
 */
export async function evaluateAllQuestions(
    allQuestions: QuestionItemInput[],
    candidateAnswers: CandidateAnswerInput[],
    jobTitle: string,
    techStack: string,
    apiKey?: string
): Promise<EvaluationSessionResult> {
    const cleanJob = jobTitle || "Software Engineer";
    const cleanStack = techStack || "Core Engineering";

    const answerMap = new Map<number, CandidateAnswerInput>();
    candidateAnswers.forEach((ca, idx) => {
        if (typeof ca.questionIndex === 'number' && ca.questionIndex >= 0) {
            answerMap.set(ca.questionIndex, ca);
        } else {
            answerMap.set(idx, ca);
        }
    });

    const answerEvaluations: IndividualAnswerEvaluation[] = [];
    const demonstratedSkillsSet = new Set<string>();
    const knowledgeGapsSet = new Set<string>();

    let totalScoreSum = 0;
    let totalTechNormSum = 0;
    let totalRelNormSum = 0;
    let totalCompNormSum = 0;
    let totalCommSum = 0;
    let totalProblemSum = 0;

    let totalTechRawSum = 0;
    let totalRelRawSum = 0;
    let totalCompRawSum = 0;
    let totalClarityRawSum = 0;
    let answeredCount = 0;

    for (let idx = 0; idx < allQuestions.length; idx++) {
        const qItem = allQuestions[idx];
        const qIndex = idx + 1;
        const qText = qItem.question || `Interview Question ${qIndex}`;

        const matched = answerMap.get(idx) || candidateAnswers.find(ca => {
            if (!ca.question) return false;
            return ca.question.trim().toLowerCase() === qText.trim().toLowerCase();
        });

        const rawAnswer = (matched?.answer || "").trim();
        const cleanAnswer = cleanText(rawAnswer);
        const isConversational = CONVERSATIONAL_NON_ANSWERS.has(cleanAnswer) ||
            cleanAnswer === "yes" || cleanAnswer === "no" ||
            rawAnswer.split(/\s+/).filter(Boolean).length < 5;

        let evalItem: IndividualAnswerEvaluation | null = null;

        // Try Gemini if API key is provided and answer is substantial and not conversational
        if (apiKey && apiKey.trim().length > 10 && rawAnswer.length > 0 && !isConversational) {
            evalItem = await evaluateSingleAnswerWithGemini(
                qItem,
                rawAnswer,
                qIndex,
                cleanJob,
                cleanStack,
                apiKey
            );
        }

        // Fallback to grounded deterministic evaluation engine
        if (!evalItem) {
            evalItem = evaluateSingleAnswer(
                qItem,
                rawAnswer,
                qIndex,
                cleanJob,
                cleanStack
            );
        }

        if (evalItem.isAnswered) {
            answeredCount++;
            const techNorm = Number(((evalItem.technicalScore / 4) * 10).toFixed(1));
            const relNorm = Number(((evalItem.relevanceScore / 2) * 10).toFixed(1));
            const compNorm = Number(((evalItem.completenessScore / 2) * 10).toFixed(1));

            totalTechNormSum += techNorm;
            totalRelNormSum += relNorm;
            totalCompNormSum += compNorm;
            totalProblemSum += evalItem.problemSolvingScore;
            totalCommSum += evalItem.communicationScore;
            totalScoreSum += evalItem.questionScore;

            totalTechRawSum += evalItem.technicalScore;
            totalRelRawSum += evalItem.relevanceScore;
            totalCompRawSum += evalItem.completenessScore;
            totalClarityRawSum += evalItem.clarityScore;

            if (evalItem.technicalScore >= 2.5) {
                demonstratedSkillsSet.add(qItem.category || `Skill Area ${qIndex}`);
            } else {
                knowledgeGapsSet.add(`${qItem.category || `Question ${qIndex}`}: ${evalItem.missingConcepts[0] || 'Needs deeper preparation'}`);
            }
        } else {
            knowledgeGapsSet.add(`Question ${qIndex} (${qItem.category || 'Core Skill'}): Not answered`);
        }

        answerEvaluations.push(evalItem);
    }

    const totalQuestions = allQuestions.length || 8;
    const isComplete = answeredCount === totalQuestions;

    if (answeredCount === 0) {
        return {
            answerEvaluations,
            answeredCount: 0,
            totalQuestions,
            isComplete: false,
            overallRating: 0,
            technicalCorrectness: 0,
            relevance: 0,
            completeness: 0,
            communication: 0,
            problemSolving: 0,
            rubricAverages: {
                technical: 0,
                relevance: 0,
                completeness: 0,
                clarity: 0
            },
            demonstratedSkills: [],
            knowledgeGaps: Array.from(knowledgeGapsSet),
            executiveFeedback: "Incomplete Interview. No answers were submitted. Please retake the session to receive a complete technical assessment."
        };
    }

    // Rubric raw averages
    const avgTechRaw = Number((totalTechRawSum / answeredCount).toFixed(1));
    const avgRelRaw = Number((totalRelRawSum / answeredCount).toFixed(1));
    const avgCompRaw = Number((totalCompRawSum / answeredCount).toFixed(1));
    const avgClarityRaw = Number((totalClarityRawSum / answeredCount).toFixed(1));

    // Component averages across answered questions (0 to 10 scale)
    const technicalCorrectness = Number((totalTechNormSum / answeredCount).toFixed(1));
    const relevance = Number((totalRelNormSum / answeredCount).toFixed(1));
    const problemSolving = Number((totalProblemSum / answeredCount).toFixed(1));
    const communication = Number((totalCommSum / answeredCount).toFixed(1));
    const completeness = Number((totalCompNormSum / answeredCount).toFixed(1));

    // Overall rating is strictly calculated using the exact weighting formula from the 5 displayed component scores!
    const overallRating = calculateWeightedScore(
        technicalCorrectness,
        relevance,
        problemSolving,
        communication,
        completeness
    );

    let executiveFeedback = "";
    if (!isComplete) {
        executiveFeedback = `Incomplete Interview (${answeredCount} of ${totalQuestions} questions answered). Candidate evaluated on submitted responses with an overall score of ${overallRating}/10. ${totalQuestions - answeredCount} question(s) were left unanswered.`;
    } else {
        if (overallRating >= 8.5) {
            executiveFeedback = `Exceptional technical performance. Candidate completed all ${totalQuestions} questions for the ${cleanJob} role with high technical precision, structured explanations, and comprehensive domain knowledge. Overall score: ${overallRating}/10.`;
        } else if (overallRating >= 6.5) {
            executiveFeedback = `Solid performance for the ${cleanJob} role. Candidate demonstrated good foundational knowledge with minor gaps in architectural trade-offs or implementation depth. Overall evaluated score: ${overallRating}/10.`;
        } else if (overallRating >= 4.0) {
            executiveFeedback = `Developing competency for the ${cleanJob} role. Several answers had notable technical gaps, missing definitions, or incomplete explanations. Overall evaluated score: ${overallRating}/10.`;
        } else {
            executiveFeedback = `Significant technical gaps identified. Multiple answers were incomplete, non-responsive, or lacked technical correctness. Substantial preparation required. Overall evaluated score: ${overallRating}/10.`;
        }
    }

    return {
        answerEvaluations,
        answeredCount,
        totalQuestions,
        isComplete,
        overallRating,
        technicalCorrectness,
        relevance,
        completeness,
        communication,
        problemSolving,
        rubricAverages: {
            technical: avgTechRaw,
            relevance: avgRelRaw,
            completeness: avgCompRaw,
            clarity: avgClarityRaw
        },
        demonstratedSkills: Array.from(demonstratedSkillsSet),
        knowledgeGaps: Array.from(knowledgeGapsSet),
        executiveFeedback
    };
}
