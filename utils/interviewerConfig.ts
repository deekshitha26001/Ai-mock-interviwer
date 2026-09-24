export interface InterviewerConfig {
    gender: "male" | "female";
    name: string;
    title: string;
    avatar: string;
    badge: string;
    description: string;
    personality: string;
    voiceKeywords: string[];
}

export const INTERVIEWER_CONFIGS: Record<"male" | "female", InterviewerConfig> = {
    male: {
        gender: "male",
        name: "Alex Vance",
        title: "Senior Technical Interviewer",
        avatar: "/avatars/male.jpg",
        badge: "Male AI Interviewer",
        description: "Professional and structured interviewer focused on technical architecture & problem solving.",
        personality: "Structured, analytical, and professional",
        voiceKeywords: ["male", "david", "guy", "christopher", "mark", "george", "alex", "daniel", "james", "richard", "en-us"]
    },
    female: {
        gender: "female",
        name: "Sarah Jenkins",
        title: "Lead Engineering Evaluator",
        avatar: "/avatars/female.jpg",
        badge: "Female AI Interviewer",
        description: "Professional and conversational interviewer focused on practical skills & communication.",
        personality: "Conversational, structured, and encouraging",
        voiceKeywords: ["female", "zira", "samantha", "jenny", "victoria", "karen", "hazel", "siri", "aria", "catherine"]
    }
};

export function getInterviewerConfig(gender?: string | null): InterviewerConfig {
    if (gender === "male") return INTERVIEWER_CONFIGS.male;
    return INTERVIEWER_CONFIGS.female;
}

/**
 * Select best matching browser Web Speech Synthesis voice for gender
 */
export function getGenderVoice(voices: SpeechSynthesisVoice[], gender: "male" | "female"): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    const config = INTERVIEWER_CONFIGS[gender];
    const keywords = config.voiceKeywords;

    // 1. Try finding voice whose name matches gender keywords
    const match = voices.find(v =>
        keywords.some(kw => v.name.toLowerCase().includes(kw.toLowerCase()))
    );
    if (match) return match;

    // 2. Fallback heuristic
    if (gender === "male") {
        const maleMatch = voices.find(v =>
            v.name.toLowerCase().includes("david") ||
            v.name.toLowerCase().includes("mark") ||
            v.name.toLowerCase().includes("george") ||
            v.name.toLowerCase().includes("male")
        );
        if (maleMatch) return maleMatch;
    } else {
        const femaleMatch = voices.find(v =>
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("victoria") ||
            v.name.toLowerCase().includes("female")
        );
        if (femaleMatch) return femaleMatch;
    }

    return voices[0] || null;
}
