import axios from "axios";

export interface QuestionItem {
    question: string;
    answer: string;
    category?: string;
    phase?: number;
    difficulty?: "easy" | "medium" | "hard" | "scenario";
}

export interface AnswerAnalysisResult {
    hasFollowUp: boolean;
    followUpQuestion: string;
    detectedKeywords: string[];
    suggestedPhase?: number;
    reason: string;
}

/**
 * Normalizes role string to standard domain category
 */
export function normalizeRole(roleStr: string, techStackStr: string = ""): string {
    const combined = `${roleStr} ${techStackStr}`.toLowerCase();
    
    if (combined.includes("java") && !combined.includes("javascript")) return "java_developer";
    if (combined.includes("python") && !combined.includes("machine learning") && !combined.includes("data science")) return "python_developer";
    if (combined.includes("frontend") || combined.includes("react") || combined.includes("next") || combined.includes("vue") || combined.includes("angular")) return "frontend_developer";
    if (combined.includes("backend") || combined.includes("node") || combined.includes("express") || combined.includes("spring") || combined.includes("django")) return "backend_developer";
    if (combined.includes("full stack") || combined.includes("fullstack")) return "fullstack_developer";
    if (combined.includes("machine learning") || combined.includes("ml engineer") || combined.includes("ai engineer") || combined.includes("deep learning")) return "aiml_engineer";
    if (combined.includes("data science") || combined.includes("data scientist")) return "data_scientist";
    if (combined.includes("data analyst") || combined.includes("analytics") || combined.includes("power bi") || combined.includes("tableau")) return "data_analyst";
    if (combined.includes("devops") || combined.includes("site reliability") || combined.includes("sre")) return "devops_engineer";
    if (combined.includes("cloud") || combined.includes("aws") || combined.includes("azure") || combined.includes("gcp")) return "cloud_engineer";
    if (combined.includes("qa") || combined.includes("test") || combined.includes("automation engineer")) return "qa_engineer";
    if (combined.includes("cyber") || combined.includes("security") || combined.includes("penetration")) return "cybersecurity_engineer";

    return "software_engineer";
}

/**
 * Role-aware 8-phase question set generator
 */
export function generateRoleAwareQuestions(
    role: string,
    jobDescription: string,
    techStack: string,
    experienceLevel: string
): QuestionItem[] {
    const domain = normalizeRole(role, techStack);
    const cleanRole = role || "Software Engineer";
    const cleanStack = techStack || "Core Technical Stack";
    const isSenior = experienceLevel.includes("3+") || experienceLevel.includes("5+");

    const questions: QuestionItem[] = [];

    // -------------------------------------------------------------
    // PHASE 1: Introduction
    // -------------------------------------------------------------
    questions.push({
        phase: 1,
        category: "Introduction",
        difficulty: "easy",
        question: `Welcome to your mock interview! To start off, please tell me about yourself and summarize your background as a ${cleanRole}.`,
        answer: `Give a concise summary of your technical background, core skills (${cleanStack}), and key project contributions.`
    });

    // -------------------------------------------------------------
    // PHASE 2: Basic Role Fundamentals (Easy)
    // -------------------------------------------------------------
    switch (domain) {
        case "java_developer":
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's discuss Java fundamentals. What are the four main pillars of Object-Oriented Programming (OOP), and can you briefly define them?`,
                answer: "Encapsulation, Inheritance, Polymorphism, and Abstraction."
            });
            break;
        case "python_developer":
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's start with Python fundamentals. What is the difference between mutable and immutable data types in Python, and can you give examples of each?`,
                answer: "Mutable: lists, dicts, sets. Immutable: tuples, strings, ints, floats."
            });
            break;
        case "frontend_developer":
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's cover web development fundamentals. Can you explain the difference between 'let', 'const', and 'var' in JavaScript, specifically regarding scoping and hoisting?`,
                answer: "'var' is function-scoped and hoisted. 'let' and 'const' are block-scoped and not hoisted (temporal dead zone)."
            });
            break;
        case "aiml_engineer":
        case "data_scientist":
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's begin with Machine Learning fundamentals. What is the core difference between Supervised and Unsupervised Learning, and what is the Bias-Variance tradeoff?`,
                answer: "Supervised uses labeled datasets; Unsupervised finds patterns in unlabeled data. Bias is underfitting error; Variance is overfitting error."
            });
            break;
        case "data_analyst":
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's discuss Data Analysis fundamentals. In SQL, what is the difference between the WHERE clause and the HAVING clause?`,
                answer: "WHERE filters rows before aggregation; HAVING filters aggregated groups after GROUP BY."
            });
            break;
        case "devops_engineer":
        case "cloud_engineer":
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's start with DevOps fundamentals. What is the difference between a Virtual Machine and a Docker Container in terms of resource allocation and isolation?`,
                answer: "VMs virtualize hardware and run full OS. Containers share the host OS kernel and are lightweight."
            });
            break;
        case "qa_engineer":
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's talk about QA fundamentals. What is the key difference between Unit Testing, Integration Testing, and Regression Testing?`,
                answer: "Unit tests individual functions. Integration tests module interactions. Regression tests verify existing features after code changes."
            });
            break;
        case "cybersecurity_engineer":
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's begin with security fundamentals. Can you explain the CIA Triad in Cybersecurity and why each component is critical?`,
                answer: "Confidentiality (privacy), Integrity (data accuracy), Availability (system uptime)."
            });
            break;
        default:
            questions.push({
                phase: 2,
                category: "Role Fundamentals",
                difficulty: "easy",
                question: `Let's cover core technical concepts. What are the key architectural principles and design patterns you rely on when developing software in ${cleanStack}?`,
                answer: "Clean architecture, separation of concerns, DRY, SOLID principles."
            });
            break;
    }

    // -------------------------------------------------------------
    // PHASE 3: Intermediate Technical Concepts (Medium)
    // -------------------------------------------------------------
    switch (domain) {
        case "java_developer":
            questions.push({
                phase: 3,
                category: "Intermediate Concepts",
                difficulty: "medium",
                question: `Great. Now let's go a step deeper. Can you explain Polymorphism with a concrete example? What is the difference between Method Overloading and Method Overriding in Java?`,
                answer: "Overloading is compile-time (same method name, different parameters). Overriding is runtime (subclass replaces superclass implementation)."
            });
            break;
        case "python_developer":
            questions.push({
                phase: 3,
                category: "Intermediate Concepts",
                difficulty: "medium",
                question: `Nice. Going deeper into Python: How do decorators work under the hood, and how do you handle concurrency or the GIL (Global Interpreter Lock) in Python?`,
                answer: "Decorators are functions that take another function as argument. GIL limits execution to 1 thread; solve via multiprocessing or async."
            });
            break;
        case "frontend_developer":
            questions.push({
                phase: 3,
                category: "Intermediate Concepts",
                difficulty: "medium",
                question: `That's clear. Now in modern React: How does component state management work, and how do you prevent unnecessary component re-renders using hooks like useMemo and useCallback?`,
                answer: "useMemo caches calculated values; useCallback caches function references across renders."
            });
            break;
        case "aiml_engineer":
        case "data_scientist":
            questions.push({
                phase: 3,
                category: "Intermediate Concepts",
                difficulty: "medium",
                question: `Good. Now moving to model training: How do you detect and address overfitting in a machine learning model? What regularization techniques do you apply?`,
                answer: "Detect via train vs val loss divergence. Address using L1/L2 regularization, dropout, early stopping, or cross-validation."
            });
            break;
        case "data_analyst":
            questions.push({
                phase: 3,
                category: "Intermediate Concepts",
                difficulty: "medium",
                question: `Great. How do you handle missing, duplicate, or corrupted data records when analyzing datasets in Pandas or SQL before building reports?`,
                answer: "Identify nulls via dropna/fillna, remove duplicates via drop_duplicates, use COALESCE in SQL, and validate data types."
            });
            break;
        case "devops_engineer":
        case "cloud_engineer":
            questions.push({
                phase: 3,
                category: "Intermediate Concepts",
                difficulty: "medium",
                question: `Going deeper into automation: How do you structure a CI/CD pipeline from code commit to zero-downtime production deployment?`,
                answer: "Lint -> Test -> Containerize -> Security Scan -> Deploy via Blue/Green or Canary strategy using GitHub Actions or GitLab CI."
            });
            break;
        default:
            questions.push({
                phase: 3,
                category: "Intermediate Concepts",
                difficulty: "medium",
                question: `Let's go deeper into application design. How do you manage API contracts, handle asynchronous data flow, and ensure error resilience in ${cleanStack}?`,
                answer: "Decoupled handlers, try/catch middleware, status codes, retry logic, and async queues."
            });
            break;
    }

    // -------------------------------------------------------------
    // PHASE 4: Practical / Programming Knowledge
    // -------------------------------------------------------------
    if (["java_developer", "python_developer", "frontend_developer", "backend_developer", "fullstack_developer", "software_engineer"].includes(domain)) {
        questions.push({
            phase: 4,
            category: "Practical & Programming",
            difficulty: "medium",
            question: `Let's test practical programming logic. How would you solve reversing a string or array in ${cleanRole === "Python Developer" ? "Python" : cleanRole === "Java Developer" ? "Java" : "code"}? Can you explain your approach and state its time and space complexity?`,
            answer: "Two-pointer approach swapping start and end indices. Time complexity O(N), Space complexity O(1) in-place or O(N)."
        });
    } else if (domain === "aiml_engineer" || domain === "data_scientist") {
        questions.push({
            phase: 4,
            category: "Practical Application",
            difficulty: "medium",
            question: `Let's look at practical data preprocessing. How would you handle feature scaling (MinMax vs StandardScaler) and categorical encoding (One-Hot vs Label Encoding) for a dataset with mixed data types?`,
            answer: "StandardScaler for normal distributions; MinMax for bounded features. One-Hot for nominal categories; Label/Ordinal for ordered categories."
        });
    } else if (domain === "data_analyst") {
        questions.push({
            phase: 4,
            category: "Practical Querying",
            difficulty: "medium",
            question: `Let's test practical SQL knowledge. How would you write a SQL query using Window Functions (like ROW_NUMBER or DENSE_RANK) to find the top 3 highest-earning employees in each department?`,
            answer: "Use CTE with ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) as rnk, then filter WHERE rnk <= 3."
        });
    } else {
        questions.push({
            phase: 4,
            category: "Practical Scenarios",
            difficulty: "medium",
            question: `Let's look at practical execution. Walk me through step-by-step how you isolate a broken feature, run diagnostic tests, and verify your resolution in a production setup.`,
            answer: "Reproduce in dev environment, inspect logs, write isolated test case, apply fix, and verify via CI pipeline."
        });
    }

    // -------------------------------------------------------------
    // PHASE 5: Project Discussion
    // -------------------------------------------------------------
    questions.push({
        phase: 5,
        category: "Project Discussion",
        difficulty: "medium",
        question: `Now I'd like to understand your practical project experience. Can you tell me about one of the main projects you have worked on recently? What was your specific role and architectural contribution?`,
        answer: "Describe application goal, your personal responsibilities, tech stack used, backend/frontend integration, and overall project outcome."
    });

    // -------------------------------------------------------------
    // PHASE 6: Resume & Tech Stack Deep-Dive
    // -------------------------------------------------------------
    questions.push({
        phase: 6,
        category: "Resume & Tech Experience",
        difficulty: "medium",
        question: `You mentioned experience with ${cleanStack}. Can you walk me through how you implemented database transactions, authentication, or key data pipelines in that setup?`,
        answer: "Detail module breakdown, authentication tokens (JWT/OAuth), ORM/DB connection pool, and security layers."
    });

    // -------------------------------------------------------------
    // PHASE 7: Problem Solving / Real-World Scenarios
    // -------------------------------------------------------------
    switch (domain) {
        case "java_developer":
        case "backend_developer":
        case "fullstack_developer":
            questions.push({
                phase: 7,
                category: "Real-World Scenarios",
                difficulty: "hard",
                question: `Let's look at a real-world scenario. Suppose your backend API suddenly takes 5 seconds to respond instead of 200ms during peak user traffic. How would you systematically investigate and resolve the issue?`,
                answer: "Check APM metrics/logs, identify slow SQL queries via EXPLAIN, check thread/connection pool exhaustion, verify external API timeouts, and add Redis caching."
            });
            break;
        case "python_developer":
            questions.push({
                phase: 7,
                category: "Real-World Scenarios",
                difficulty: "hard",
                question: `Scenario question: A Python microservice in production experiences high CPU usage and memory leaks during heavy load. How do you profile the application and isolate the leaky code?`,
                answer: "Use memory profilers (tracemalloc, cProfile), inspect unclosed connections/generators, check global variables, and optimize loops."
            });
            break;
        case "frontend_developer":
            questions.push({
                phase: 7,
                category: "Real-World Scenarios",
                difficulty: "hard",
                question: `Scenario question: Your React web app loads quickly on desktop but lags severely and breaks layout on mobile browsers. How do you debug and fix performance and responsive layout issues?`,
                answer: "Use Chrome DevTools Lighthouse/Performance tab, optimize bundle size, implement media queries, defer non-critical JS, and use virtualized lists."
            });
            break;
        case "aiml_engineer":
        case "data_scientist":
            questions.push({
                phase: 7,
                category: "Real-World Scenarios",
                difficulty: "hard",
                question: `Scenario question: Your trained model achieved 98% accuracy during training, but when deployed live, predictions drop significantly due to data drift. How do you monitor and fix this?`,
                answer: "Implement data drift monitoring (Evidently AI/KS-test), trigger automated model retraining pipelines with recent production data, and update baseline features."
            });
            break;
        case "devops_engineer":
        case "cloud_engineer":
            questions.push({
                phase: 7,
                category: "Real-World Scenarios",
                difficulty: "hard",
                question: `Scenario question: A production deployment container continuously crashes with CrashLoopBackOff in Kubernetes. What commands and steps do you take to diagnose and resolve it?`,
                answer: "Run `kubectl logs` and `kubectl describe pod`, check OOMKilled status/memory limits, verify environment variables and secrets, and check readiness probes."
            });
            break;
        default:
            questions.push({
                phase: 7,
                category: "Real-World Scenarios",
                difficulty: "hard",
                question: `Scenario question: A critical system feature fails in production right after a release. What is your immediate incident response workflow to mitigate impact and fix the issue?`,
                answer: "Roll back to last stable release, alert team, inspect error logs and telemetry, reproduce locally, apply hotfix with unit test, and redeploy."
            });
            break;
    }

    // -------------------------------------------------------------
    // PHASE 8: HR & Behavioral Questions
    // -------------------------------------------------------------
    questions.push({
        phase: 8,
        category: "HR & Behavioral",
        difficulty: "easy",
        question: `To wrap up our interview: What are your key technical strengths as a ${cleanRole}? Tell me about a technical challenge you faced while working in a team and how you resolved it.`,
        answer: "Highlight core technical strengths, collaborative problem-solving, open technical communication, and commitment to project success."
    });

    return questions;
}

/**
 * Adaptive Real-Time Follow-Up & Next Question Engine
 * Evaluates candidate answer and returns conversational interviewer follow-up
 */
export async function generateAdaptiveFollowUp(params: {
    currentQuestion: string;
    candidateAnswer: string;
    jobTitle?: string;
    techStack?: string;
    experienceLevel?: string;
    currentPhase?: number;
    apiKey?: string;
}): Promise<AnswerAnalysisResult> {
    const { currentQuestion, candidateAnswer, jobTitle, techStack, currentPhase, apiKey } = params;

    const answerText = (candidateAnswer || "").trim();
    const answerLower = answerText.toLowerCase();
    const words = answerText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const cleanRole = jobTitle || "Software Engineer";
    const cleanStack = techStack || "Technical Stack";

    // 1. Try Gemini API first if API key is provided
    if (apiKey && apiKey.trim().length > 10) {
        try {
            const geminiPrompt = `You are a professional, friendly, and highly intelligent technical interviewer interviewing a candidate for the role of ${cleanRole}.

Current Question Asked: "${currentQuestion}"
Candidate's Answer: "${answerText}"
Tech Stack: ${cleanStack}
Current Phase: Phase ${currentPhase || 1} of 8

Instructions:
1. Act like a real human interviewer (warm, professional, observant).
2. Evaluate the candidate's response.
3. If candidate mentioned a specific technology (e.g. Spring Boot, React, Docker, Pandas, SQL, etc.) or a project name, ask a natural follow-up probing that technology/project!
4. If candidate's answer is brief or vague, ask a clarifying follow-up.
5. If candidate struggled or said "I don't know", transition smoothly without repeating the failed question.
6. Use natural conversational transitions like:
   - "That's a solid explanation. Let's build on that..."
   - "You mentioned X. Can you explain how you used that in your project?"
   - "Great! Now let's explore..."
   - "No problem at all! Let's pivot to..."
7. Keep your response under 3 sentences. Output JSON format:
{
  "hasFollowUp": true,
  "followUpQuestion": "<Conversational next question with transition>",
  "detectedKeywords": ["keyword1"],
  "reason": "explanation"
}`;

            const geminiRes = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    contents: [{ parts: [{ text: geminiPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                },
                { timeout: 7000 }
            );

            const jsonStr = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonStr) {
                const parsed = JSON.parse(jsonStr);
                if (parsed.followUpQuestion) {
                    return {
                        hasFollowUp: true,
                        followUpQuestion: parsed.followUpQuestion,
                        detectedKeywords: parsed.detectedKeywords || [],
                        reason: parsed.reason || "gemini_adaptive"
                    };
                }
            }
        } catch (geminiErr) {
            console.warn("Gemini API call notice, falling back to role-intelligence engine:", geminiErr);
        }
    }

    // 2. Rule-Based Role Intelligence Engine Fallback

    // Handle "I don't know" or severe struggle
    const dontKnowPhrases = ["i don't know", "i'm not sure", "dont know", "no idea", "not familiar", "haven't used"];
    const isStruggling = dontKnowPhrases.some(phrase => answerLower.includes(phrase)) || (wordCount < 4 && !answerLower.includes("yes"));

    if (isStruggling) {
        return {
            hasFollowUp: true,
            followUpQuestion: `No problem at all! Let's pivot to another topic. Can you tell me about a technology or tool in ${cleanStack} that you feel most confident working with?`,
            detectedKeywords: [],
            reason: "candidate_struggled_pivot"
        };
    }

    // Handle short / brief answer
    if (wordCount < 12) {
        return {
            hasFollowUp: true,
            followUpQuestion: `That's a good start! Could you elaborate a bit more with a concrete example from your recent experience with ${cleanRole}?`,
            detectedKeywords: [],
            reason: "short_answer_elaboration"
        };
    }

    // Extract specific technology triggers from candidate's answer
    const techTriggers: { keywords: string[]; question: string; reason: string }[] = [
        {
            keywords: ["spring", "spring boot", "bean", "ioc"],
            question: "You mentioned Spring Boot. How did you structure your beans and handle dependency injection in your project? Why choose constructor injection over field injection?",
            reason: "spring_deepdive"
        },
        {
            keywords: ["jwt", "token", "auth", "oauth"],
            question: "You mentioned authentication. Can you walk me step-by-step through how token validation and refresh token rotation work in your application?",
            reason: "auth_deepdive"
        },
        {
            keywords: ["react", "redux", "context", "hook", "next"],
            question: "You referenced React state management. How did you prevent unnecessary re-renders when passing state across component hierarchies?",
            reason: "react_deepdive"
        },
        {
            keywords: ["sql", "postgres", "mysql", "query", "index"],
            question: "You mentioned working with database queries. How did you optimize query performance, and when would you create a database index?",
            reason: "sql_deepdive"
        },
        {
            keywords: ["docker", "kubernetes", "container", "ci/cd"],
            question: "You brought up containerization. How did you handle environment variables and multi-stage container builds in your pipeline?",
            reason: "devops_deepdive"
        },
        {
            keywords: ["pandas", "numpy", "dataframe"],
            question: "You mentioned Pandas. How do you handle missing values or perform efficient group-by aggregations on large datasets?",
            reason: "data_deepdive"
        },
        {
            keywords: ["pytorch", "tensorflow", "model", "training"],
            question: "You brought up machine learning models. How did you choose your baseline metrics and prevent model overfitting?",
            reason: "ml_deepdive"
        },
        {
            keywords: ["api", "rest", "endpoint", "microservice"],
            question: "You referenced API development. How did you handle rate limiting, error fallbacks, and request validation for your endpoints?",
            reason: "api_deepdive"
        }
    ];

    for (const trigger of techTriggers) {
        if (trigger.keywords.some(kw => answerLower.includes(kw))) {
            const detected = trigger.keywords.filter(kw => answerLower.includes(kw));
            return {
                hasFollowUp: true,
                followUpQuestion: trigger.question,
                detectedKeywords: detected,
                reason: trigger.reason
            };
        }
    }

    // Default conversational human follow-up
    return {
        hasFollowUp: true,
        followUpQuestion: `That's a solid explanation. Where in your project work did you apply that approach, and what was the main technical trade-off you had to consider?`,
        detectedKeywords: [],
        reason: "conversational_adaptive_general"
    };
}
