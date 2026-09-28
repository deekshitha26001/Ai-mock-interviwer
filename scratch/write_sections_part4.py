import os

workspace_dir = r"c:\Users\Deekshitha P\Documents\AI-Mock-Interview-2.0-main"
md_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.md")

print("Appending Sections 21 to 30...")

with open(md_path, "a", encoding="utf-8") as f:
    f.write("""
# 21. PROJECT LIMITATIONS

1. **Web Speech API Browser Variance:**
   - *Limitation:* Speech recognition accuracy and voice quality depend on client browser engines (Google Chrome provides native Web Speech support, whereas Safari/Firefox have partial support).
   - *Impact:* Speech-to-text accuracy may drop in non-Chrome browsers.
   - *Improvement:* Replace browser Web Speech API with server-side OpenAI Whisper API.

2. **Canvas Heuristic Vision Proxy vs Deep Neural Landmark Mesh:**
   - *Limitation:* The computer vision telemetry engine uses Canvas RGB skin centroid heuristic sampling rather than heavy 468-point 3D face mesh models (e.g. MediaPipe).
   - *Impact:* Measures general head pose and centroid stability rather than micro-expressions.
   - *Improvement:* Integrate lightweight WebGL facial landmark models for detailed emotion detection.

3. **Vercel Serverless Payload Limit (4.5MB):**
   - *Limitation:* Traditional HTTP POST uploads fail on Vercel if video files exceed 4.5MB.
   - *Impact:* Bypassed via direct Convex Storage signed URLs, but server upload route requires fallback streaming.
   - *Improvement:* Implement client-side chunked multipart upload directly to cloud S3/R2 storage buckets.

---

# 22. FUTURE ENHANCEMENTS

1. **Real-Time WebRTC Audio Streaming:** Replace browser Speech Recognition with continuous WebRTC audio streaming to a Python Whisper server for multi-lingual transcript parsing.
2. **Automated Resume Parser (PDF to AST):** Integrate `pdf-parse` or LLM vision models to automatically extract key skills, past projects, and metrics from uploaded resumes to pre-fill the interview configuration.
3. **Peer Benchmarking Dashboard:** Provide global candidate percentile rankings comparing performance against other applicants interviewing for the same target role.
4. **Code Sandbox Component:** Embed an interactive Monaco editor (`@monaco-editor/react`) for Phase 4 coding logic questions allowing real-time code execution.

---

# 23. RECRUITER & INTERVIEW QUESTION BANK

### A. Project Overview Questions
- **Q:** *What is your project, and why did you build it?*
  - **Simple Answer:** "MAPD AI Mock Interview 2.0 is a web application that conducts interactive technical mock interviews using AI persona voices and generates detailed feedback reports."
  - **Technical Answer:** "It's a full-stack Next.js 15 application featuring role-aware 8-phase question progression, Web Speech synthesis and recognition, Canvas 2D vision telemetry, multi-tier video storage, and grounded transcript evaluation using Gemini 1.5 Flash."
  - **Project-Specific Answer:** "I built it to solve the problem of generic, non-interactive mock interview tools. It normalizes target job titles, generates stack-specific question progressions, tracks candidate posture and speech clarity, and stores recordings in Convex and cloud storage."
  - **Follow-Up:** *How does your system prevent AI hallucination during evaluation?*
  - **Follow-Up Answer:** "In `app/api/interview-feedback/route.tsx`, the evaluation algorithm parses the actual candidate spoken text array. Scores are derived by searching candidate quotes for explicit technical concepts, regex-matching verbal filler words, and computing speaking pace WPM rather than asking the LLM to invent scores arbitrarily."

### B. Architecture Questions
- **Q:** *Why did you choose Next.js 15 App Router instead of a separate React frontend and Express backend?*
  - **Simple Answer:** "Next.js App Router lets me build both the React user interface and serverless API endpoints in one unified project."
  - **Technical Answer:** "Using Next.js App Router eliminates CORS configuration overhead between decoupled origins. It leverages Server Components for static page rendering and API route handlers for serverless backend tasks."

### C. Database Questions
- **Q:** *Why choose Convex over a traditional relational database like PostgreSQL?*
  - **Simple Answer:** "Convex is a serverless reactive database that pushes live data updates to the screen automatically without manual polling."
  - **Technical Answer:** "Convex provides persistent WebSocket subscriptions for `useQuery` hooks. When a session feedback record is patched in `InterviewSessionTable`, all dashboard components re-render reactively without requiring custom WebSocket servers or manual REST polling."

---

# 24. DIFFICULT CROSS-QUESTIONS (PROVING PERSONAL CODE OWNERSHIP)

1. **Q:** *"Show me where the actual question progression logic is implemented."*
   - **Answer:** "It's inside `lib/roleInterviewerEngine.ts` in the `generateRoleAwareQuestions()` function. It normalizes job titles via `normalizeRole()` and builds an 8-phase array of `QuestionItem` objects covering Intro, Fundamentals, Intermediate concepts, Practical logic, Project walkthrough, Tech stack deep-dive, Scenarios, and HR STAR questions."

2. **Q:** *"What happens if the candidate loses internet connection during the interview?"*
   - **Answer:** "In `utils/recordingStorage.ts`, the `uploadRecordingToCloud()` function saves the `video/webm` blob to local client IndexedDB (`MAPD_Interview_Recordings_DB`) *first* before attempting cloud upload. If the network drops, the recording remains preserved locally and can be retrieved via `getRecordingBlob()`."

3. **Q:** *"Why did you use regex matching for verbal filler detection instead of asking an LLM?"*
   - **Answer:** "LLMs are nondeterministic and slow for simple string pattern extraction. In `app/api/interview-feedback/route.tsx`, executing `/\b(um|uh|like|you know|basically|actually)\b/gi` on the transcribed text array runs in under 1ms with 100% deterministic precision and zero API cost."

---

# 25. "INTERVIEWER OPENS YOUR GITHUB" CHECKLIST

When a technical recruiter or engineering manager opens your GitHub repository, ensure you can point out:
- **Clean Root Configuration:** `.env.example` documenting all necessary keys without exposing real credentials.
- **Middleware Protection (`middleware.ts`):** Demonstrating server-side route security with Clerk auth.
- **Strict Schema Definitions (`convex/schema.ts`):** Proving structured type validation for all database collections.
- **Modular Utility Engine (`lib/roleInterviewerEngine.ts`):** Highlighting clean separation of business logic from UI components.
- **Production Build Cleanliness:** Zero unresolved TypeScript or ESLint errors during `npm run build`.

---

# 26. "EXPLAIN THIS CODE ON A WHITEBOARD"

### Whiteboard 1: Canvas 2D Vision Telemetry Algorithm (`utils/facialAnalysis.ts`)
- **Problem:** Calculate real-time candidate eye contact, posture stability, and stress indicators without calling expensive external vision APIs.
- **Approach:** Draw HTML5 video frame onto an offscreen 320x240 canvas context and sample RGB pixels to find skin centroid coordinates.
- **Logic:**
  ```typescript
  // 1. Sample RGB pixels for skin color heuristics (R > 60, G > 40, B > 20, R > G, R > B)
  // 2. Accumulate skinPixelCount and sum skinCenterX, skinCenterY
  // 3. Compute centroid: avgX = skinCenterX / skinPixelCount, avgY = skinCenterY / skinPixelCount
  // 4. Calculate displacement from canvas target center (160, 120)
  // 5. Eye Contact % = 100 - (displacement * 45)
  // 6. Map displacement to "Centered", "Slight Tilt", or "Looking Away"
  ```
- **Complexity:** Time $O(W \times H / 16)$, Space $O(1)$ offscreen canvas.

---

# 27. COMPLEXITY ANALYSIS

1. **Role Normalization (`normalizeRole`):** Time $O(K)$ where $K$ is string length, Space $O(1)$.
2. **Filler Word Analytics (`evaluateCandidateAnswers`):** Time $O(N)$ where $N$ is total word count in spoken transcript, Space $O(W)$ for filler frequency map.
3. **Canvas Vision Frame Sampling (`analyzeVideoFrame`):** Time $O(\frac{320 \times 240}{4}) \approx 19,200$ iterations (under 2ms execution time), Space $O(1)$ fixed canvas context.

---

# 28. REAL INTERVIEW SIMULATION

- **Round 1 (Architecture):** *"Walk me through how your Next.js frontend communicates with Convex."*  
  *Candidate:* "We wrap our root layout in `ConvexClientProvider`. Components consume `useQuery(api.Interview.GetInterviewList)` which establishes a reactive WebSocket connection..."
- **Round 2 (Backend / AI):** *"What happens when Gemini API fails?"*  
  *Candidate:* "In `generateAdaptiveFollowUp()`, if Gemini API times out or throws an error, the catch block logs a warning and falls back to our rule-based role intelligence engine..."

---

# 29. QUESTIONS I SHOULD NEVER ANSWER INCORRECTLY (MEMORIZE THIS)

1. **Database Used:** Convex Serverless Reactive Database.
2. **Primary Framework:** Next.js 15 App Router & React 19.
3. **Authentication:** Clerk (`@clerk/nextjs`).
4. **AI Model:** Google Gemini 1.5 Flash API.
5. **Rate Limiting Tool:** Arcjet Token Bucket algorithm.
6. **Local Backup System:** Browser IndexedDB (`MAPD_Interview_Recordings_DB`).
7. **Primary Storage Providers:** Convex Storage, Supabase Storage (`interview-recordings`), ImageKit.
8. **Feedback Scoring Formula:** Tech (35%) + Problem Solving (25%) + Relevance (15%) + Completeness (15%) + Communication (10%).

---

# 30. 1-DAY PROJECT PREPARATION PLAN

- **Hour 1:** Memorize Section 1 Overview & 30s/1m/2m pitches.
- **Hour 2:** Study Technology Stack table (Section 2) and practice why each tech was chosen.
- **Hour 3:** Review System Architecture & Request-Response execution flow (Sections 3 & 4).
- **Hour 4:** Walk through `lib/roleInterviewerEngine.ts` and `app/api/interview-feedback/route.tsx` code logic.
- **Hour 5:** Review Database Schema & Convex query/mutation patterns (Section 8).
- **Hour 6:** Practice Security & Authentication questions (Section 9).
- **Hour 7:** Practice Difficult Cross-Questions (Section 24).
- **Hour 8:** Run Real Interview Simulation (Section 28) aloud.
""")

print("Sections 21 to 30 appended.")
