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

export const MALE_VOICE_KEYWORDS = [
    "david", "mark", "george", "guy", "christopher", "alex", "daniel",
    "james", "richard", "eric", "steffan", "roger", "brian", "fred",
    "male", "uk english male", "us english male", "man"
];

export const FEMALE_VOICE_KEYWORDS = [
    "zira", "samantha", "jenny", "victoria", "karen", "hazel", "aria",
    "catherine", "susan", "heera", "linda", "fiona", "moira", "tessa",
    "veena", "siri", "female", "google us english", "uk english female", "us english female", "woman"
];

export const INTERVIEWER_CONFIGS: Record<"male" | "female", InterviewerConfig> = {
    male: {
        gender: "male",
        name: "Alex Vance",
        title: "Senior Technical Interviewer",
        avatar: "/avatars/male.jpg",
        badge: "Male AI Interviewer",
        description: "Professional and structured interviewer focused on technical architecture & problem solving.",
        personality: "Structured, analytical, and professional",
        voiceKeywords: MALE_VOICE_KEYWORDS
    },
    female: {
        gender: "female",
        name: "Sarah Jenkins",
        title: "Lead Engineering Evaluator",
        avatar: "/avatars/female.jpg",
        badge: "Female AI Interviewer",
        description: "Professional and conversational interviewer focused on practical skills & communication.",
        personality: "Conversational, structured, and encouraging",
        voiceKeywords: FEMALE_VOICE_KEYWORDS
    }
};

export function getInterviewerConfig(gender?: string | null): InterviewerConfig {
    if (gender === "male") return INTERVIEWER_CONFIGS.male;
    return INTERVIEWER_CONFIGS.female;
}

/**
 * Checks whether a given Web Speech API voice is matching a target gender
 */
export function isVoiceMatchingGender(voiceName: string, targetGender: "male" | "female"): boolean {
    const name = voiceName.toLowerCase();
    const targetKws = targetGender === "female" ? FEMALE_VOICE_KEYWORDS : MALE_VOICE_KEYWORDS;
    const oppositeKws = targetGender === "female" ? MALE_VOICE_KEYWORDS : FEMALE_VOICE_KEYWORDS;

    const matchesTarget = targetKws.some(kw => name.includes(kw));
    const matchesOpposite = oppositeKws.some(opp => name.includes(opp) && !name.includes(targetGender));

    return matchesTarget && !matchesOpposite;
}

/**
 * Select best matching browser Web Speech Synthesis voice for female AI or male AI
 */
export function getGenderVoice(voices: SpeechSynthesisVoice[], gender: "male" | "female"): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    const isFemale = gender === "female";
    const targetKws = isFemale ? FEMALE_VOICE_KEYWORDS : MALE_VOICE_KEYWORDS;
    const oppositeKws = isFemale ? MALE_VOICE_KEYWORDS : FEMALE_VOICE_KEYWORDS;

    // 1. Pass 1: Try finding high-priority exact keyword matches for gender that don't match opposite gender
    for (const kw of targetKws) {
        const match = voices.find(v => {
            const name = v.name.toLowerCase();
            const matchesKw = name.includes(kw);
            const matchesOpposite = oppositeKws.some(opp => name.includes(opp) && !name.includes(kw));
            return matchesKw && !matchesOpposite;
        });
        if (match) return match;
    }

    // 2. Pass 2: Look for explicit 'female' or 'male' labels in voice name or lang
    const explicitMatch = voices.find(v => {
        const name = v.name.toLowerCase();
        return isFemale ? (name.includes("female") || name.includes("woman")) : (name.includes("male") || name.includes("man"));
    });
    if (explicitMatch) return explicitMatch;

    // 3. Pass 3: Fallback English voice excluding opposite gender keywords
    const fallbackMatch = voices.find(v => {
        const name = v.name.toLowerCase();
        const matchesOpposite = oppositeKws.some(opp => name.includes(opp));
        return !matchesOpposite && (v.lang.startsWith("en") || !v.lang);
    });
    if (fallbackMatch) return fallbackMatch;

    return voices[0] || null;
}

