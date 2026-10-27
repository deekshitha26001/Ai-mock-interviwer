import {
    evaluateSingleAnswer,
    evaluateAllQuestions,
    calculateWeightedScore,
    isGenuineYesNoQuestion,
    type QuestionItemInput,
    type CandidateAnswerInput
} from "../lib/answerEvaluationEngine";

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

async function runTests() {
    console.log("=== RUNNING SCORING ENGINE TESTS ===\n");

    const sampleQ: QuestionItemInput = {
        question: "Let's discuss Java fundamentals. What are the four main pillars of Object-Oriented Programming (OOP), and can you briefly define them?",
        answer: "Encapsulation, Inheritance, Polymorphism, and Abstraction.",
        category: "Role Fundamentals",
        phase: 2
    };

    const introQ: QuestionItemInput = {
        question: "Welcome to your mock interview! To start off, please tell me about yourself and summarize your background as a java developer.",
        answer: "Give a concise summary of your technical background, core skills (Core Technical Stack), and key project contributions.",
        category: "Introduction",
        phase: 1
    };

    // TEST 1: Empty Answer
    console.log("--- Test 1: Empty Answer ---");
    const emptyResult = evaluateSingleAnswer(sampleQ, "", 1);
    assert(emptyResult.questionScore === 0, "Empty answer gets 0 score");
    assert(emptyResult.technicalScore === 0, "Empty answer gets 0 tech score");
    assert(emptyResult.communicationScore === 0, "Empty answer gets 0 communication score");
    assert(emptyResult.isAnswered === false, "Empty answer is marked unanswered");
    assert(emptyResult.scoreBand === "Empty / Irrelevant", "Empty answer scoreBand is Empty / Irrelevant");

    // TEST 2: "ok" Conversational Filler
    console.log("\n--- Test 2: 'ok' Answer ---");
    const okResult = evaluateSingleAnswer(sampleQ, "ok", 1);
    assert(okResult.questionScore === 0, "'ok' answer gets 0 score");
    assert(okResult.technicalScore === 0, "'ok' answer gets 0 tech score");
    assert(okResult.relevanceScore === 0, "'ok' answer gets 0 relevance score");
    assert(okResult.communicationScore === 0, "'ok' answer gets 0 communication score");
    assert(okResult.problemSolvingScore === 0, "'ok' answer gets 0 problem-solving score");
    assert(okResult.scoreBand === "Empty / Irrelevant", "'ok' scoreBand is Empty / Irrelevant");

    // TEST 3: "yes" to Technical Question
    console.log("\n--- Test 3: 'yes' to Technical Question ---");
    const yesResult = evaluateSingleAnswer(sampleQ, "yes", 1);
    assert(yesResult.questionScore === 0, "'yes' to technical question gets 0 score");
    assert(yesResult.technicalScore === 0, "'yes' gets 0 tech score");
    assert(yesResult.communicationScore === 0, "'yes' gets 0 communication score");
    assert(yesResult.scoreBand === "Empty / Irrelevant", "'yes' scoreBand is Empty / Irrelevant");

    // TEST 4: "I don't know" / Refusal
    console.log("\n--- Test 4: 'I don't know' / Refusal ---");
    const idkResult = evaluateSingleAnswer(sampleQ, "I don't know", 1);
    assert(idkResult.technicalScore === 0, "'I don't know' gets 0 tech score");
    assert(idkResult.questionScore <= 1.0, "'I don't know' gets score <= 1.0");
    assert(idkResult.scoreBand === "Empty / Irrelevant", "'I don't know' scoreBand is Empty / Irrelevant");
    assert(idkResult.communicationScore <= 1.5, "'I don't know' communication score is low (<= 1.5)");

    // TEST 5: Irrelevant Answer
    console.log("\n--- Test 5: Completely Irrelevant Answer ---");
    const irreleventResult = evaluateSingleAnswer(
        sampleQ,
        "I really enjoy eating pepperoni pizza and watching basketball with my best friends every single Saturday evening.",
        1
    );
    assert(irreleventResult.questionScore === 0, "Irrelevant answer gets 0 score");
    assert(irreleventResult.technicalScore === 0, "Irrelevant answer gets 0 tech score");
    assert(irreleventResult.relevanceScore === 0, "Irrelevant answer gets 0 relevance score");
    assert(irreleventResult.scoreBand === "Empty / Irrelevant", "Irrelevant answer scoreBand is Empty / Irrelevant");

    // TEST 6: Very Short Answer (< 6 words)
    console.log("\n--- Test 6: Very Short Answer (e.g. 2 words) ---");
    const shortResult = evaluateSingleAnswer(sampleQ, "Java code", 1);
    assert(shortResult.questionScore === 0, "Non-concept short answer gets 0 score");
    const shortKeywordResult = evaluateSingleAnswer(sampleQ, "Encapsulation only", 1);
    assert(shortKeywordResult.questionScore <= 3.0, "Short keyword-only answer gets low score (<= 3.0)");
    assert(shortKeywordResult.completenessScore <= 0.5, "Short keyword-only answer gets low completeness (<= 0.5)");

    // TEST 7: Partially Correct Answer (Names pillars without requested definitions)
    console.log("\n--- Test 7: Partially Correct Answer ---");
    const partialAnswer = "The four pillars of OOP are encapsulation, inheritance, polymorphism, and abstraction.";
    const partialResult = evaluateSingleAnswer(sampleQ, partialAnswer, 1);
    assert(partialResult.technicalScore >= 2.0 && partialResult.technicalScore <= 3.0, "Partial answer gets moderate tech score (2.0 - 3.0)");
    assert(partialResult.completenessScore <= 1.2, "Partial answer missing definitions gets completeness <= 1.2");
    assert(partialResult.questionScore >= 4.0 && partialResult.questionScore <= 7.0, "Partial answer gets moderate score (4.0 - 7.0)");
    assert(partialResult.scoreBand === "Partially Correct" || partialResult.scoreBand === "Moderately Good", "Score band is Partially Correct or Moderately Good");

    // TEST 8: Meaningful Correct Answer (Complete with definitions and reasoning)
    console.log("\n--- Test 8: Meaningful Correct Answer ---");
    const completeAnswer = "The four main pillars of OOP in Java are Encapsulation, Inheritance, Polymorphism, and Abstraction. Encapsulation bundles data and methods together while restricting direct access using access modifiers. Inheritance allows a subclass to inherit properties from a superclass to reuse code. Polymorphism allows methods to take multiple forms through method overloading at compile-time and method overriding at runtime. Abstraction hides internal implementation details and exposes only essential interfaces to reduce complexity.";
    const completeResult = evaluateSingleAnswer(sampleQ, completeAnswer, 1);
    assert(completeResult.technicalScore >= 3.6, "Complete answer gets high tech score (>= 3.6 / 4)");
    assert(completeResult.relevanceScore === 2.0, "Complete answer gets full relevance (2.0 / 2)");
    assert(completeResult.completenessScore === 2.0, "Complete answer gets full completeness (2.0 / 2)");
    assert(completeResult.communicationScore >= 8.5, "Complete answer gets high communication (>= 8.5 / 10)");
    assert(completeResult.problemSolvingScore >= 8.0, "Complete answer gets high problem solving (>= 8.0 / 10)");
    assert(completeResult.questionScore >= 8.5, "Complete answer gets high overall score (>= 8.5 / 10)");
    assert(completeResult.scoreBand === "Strong" || completeResult.scoreBand === "Exceptional", "Score band is Strong or Exceptional");

    // TEST 9: THE USER BUG SCENARIO - Candidate answered only "yes" and "ok"
    console.log("\n--- Test 9: USER BUG SCENARIO (Candidate answered only 'yes' and 'ok') ---");
    const twoQuestions: QuestionItemInput[] = [introQ, sampleQ];
    const candidateAnswers: CandidateAnswerInput[] = [
        { question: introQ.question, answer: "yes", questionIndex: 0 },
        { question: sampleQ.question, answer: "ok", questionIndex: 1 }
    ];

    const sessionResult = await evaluateAllQuestions(
        twoQuestions,
        candidateAnswers,
        "Java Developer",
        "Java, Spring Boot"
    );

    console.log(`Reported overall rating: ${sessionResult.overallRating} / 10`);
    console.log(`Reported technical correctness: ${sessionResult.technicalCorrectness} / 10`);
    console.log(`Reported relevance: ${sessionResult.relevance} / 10`);
    console.log(`Reported problem solving: ${sessionResult.problemSolving} / 10`);
    console.log(`Reported communication: ${sessionResult.communication} / 10`);
    console.log(`Reported completeness: ${sessionResult.completeness} / 10`);

    // The user bug was: overall score was 5.9/10, communication clarity was 9/10
    // Now: MUST be 0.0 / 10 across the board!
    assert(sessionResult.overallRating === 0.0, "Overall score for 'yes' and 'ok' is 0.0/10 (FIXED from 5.9/10)");
    assert(sessionResult.communication === 0.0, "Communication clarity for 'yes' and 'ok' is 0.0/10 (FIXED from 9/10)");
    assert(sessionResult.technicalCorrectness === 0.0, "Technical correctness is 0.0/10");
    assert(sessionResult.relevance === 0.0, "Relevance is 0.0/10");
    assert(sessionResult.completeness === 0.0, "Completeness is 0.0/10");
    assert(sessionResult.problemSolving === 0.0, "Problem solving is 0.0/10");

    // TEST 10: Formula Agreement Verification
    console.log("\n--- Test 10: Formula Agreement Verification ---");
    // Verify that calculateWeightedScore(tech, rel, problem, comm, comp) equals overallRating
    const formulaCalculated = calculateWeightedScore(
        sessionResult.technicalCorrectness,
        sessionResult.relevance,
        sessionResult.problemSolving,
        sessionResult.communication,
        sessionResult.completeness
    );
    assert(formulaCalculated === sessionResult.overallRating, `Formula calculated (${formulaCalculated}) agrees with session overallRating (${sessionResult.overallRating})`);

    // Also test formula agreement on a mixed session
    const mixedCandidateAnswers: CandidateAnswerInput[] = [
        { question: introQ.question, answer: "I have 4 years of experience as a Java Developer working with Spring Boot, microservices, and PostgreSQL database. I built payment services and scaled throughput.", questionIndex: 0 },
        { question: sampleQ.question, answer: partialAnswer, questionIndex: 1 }
    ];
    const mixedSession = await evaluateAllQuestions(
        twoQuestions,
        mixedCandidateAnswers,
        "Java Developer",
        "Java, Spring Boot"
    );
    const mixedFormula = calculateWeightedScore(
        mixedSession.technicalCorrectness,
        mixedSession.relevance,
        mixedSession.problemSolving,
        mixedSession.communication,
        mixedSession.completeness
    );
    console.log(`Mixed session overall: ${mixedSession.overallRating}, Formula: ${mixedFormula}`);
    assert(mixedSession.overallRating === mixedFormula, `Mixed session overallRating (${mixedSession.overallRating}) agrees with formula (${mixedFormula})`);

    console.log("\n🎉 ALL TESTS COMPLETED AND PASSED SUCCESSFULLY!");
}

runTests().catch(err => {
    console.error("Test error:", err);
    process.exit(1);
});
