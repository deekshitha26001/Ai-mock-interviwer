import os

workspace_dir = r"c:\Users\Deekshitha P\Documents\AI-Mock-Interview-2.0-main"
md_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.md")

print("Appending Sections 11 to 20...")

with open(md_path, "a", encoding="utf-8") as f:
    f.write("""
# 11. API DOCUMENTATION & REST CONCEPTS

### 1. REST Architectural Principles in MAPD
- **Stateless Endpoint Execution:** Next.js API route handlers process requests without storing session state in memory; session state persists in Convex DB or Clerk Auth tokens.
- **Resource-Oriented Endpoint Naming:** Clear noun-action routes (`/api/generate-interview-questions`, `/api/upload-recording`, `/api/interview-feedback`).
- **HTTP Status Codes:**
  - `200 OK`: Successful question generation, feedback calculation, or recording deletion.
  - `400 Bad Request`: Missing `interviewId` or invalid video blob payload.
  - `401 Unauthorized`: Missing or unauthenticated Clerk session token.
  - `403 Forbidden`: Attempting to delete a storage object owned by another user.
  - `429 Too Many Requests`: Arcjet rate limit bucket empty.
  - `500 Internal Server Error`: Unhandled exception during API execution.

---

# 12. COMPLETE DATA FLOW

### 1. Trace 1: Generating an 8-Phase Customized Interview
1. Candidate fills form in `CreateInterviewDialog.tsx` (Job Title, Job Description, Tech Stack, Experience Level, optional PDF resume).
2. Form submits `POST` multipart request to `/api/generate-interview-questions`.
3. Endpoint executes Arcjet security check (`aj.protect`).
4. If PDF file present, Buffer uploads to ImageKit storage via `imagekit.upload()`, returning `resumeUrl`.
5. `generateRoleAwareQuestions()` normalizes job title (e.g. "Java Developer") and builds 8-phase questions array.
6. Client invokes Convex mutation `SaveInterviewQuestion`, storing record in `InterviewSessionTable` with status `'draft'`.
7. Client receives returned `recordId` and redirects to `/interview/[interviewId]`.

### 2. Trace 2: Live Session Execution, Speech Recognition & Adaptive Follow-Up
1. Candidate lands on `/interview/[interviewId]/start/page.tsx`.
2. Browser `SpeechSynthesis` speaks Question 1 ("Tell me about yourself") using selected AI voice persona.
3. Candidate speaks response into microphone; Web Speech API (`webkitSpeechRecognition`) transcribes text into `userInputText`.
4. Candidate clicks "Next Question".
5. Client sends `POST` request to `/api/generate-followup-question`.
6. Endpoint sends payload to Gemini 1.5 Flash API. If candidate mentioned technical keywords (e.g., "Spring Boot"), Gemini returns a probing follow-up. If candidate struggled ("I don't know"), rule engine pivots smoothly to another topic.
7. Next question renders and audio visualizer updates.

### 3. Trace 3: Multi-Tier Recording Persistence Pipeline
1. `MediaRecorder` captures `video/webm` camera stream in browser.
2. When candidate clicks "End Call", `uploadRecordingToCloud()` executes in `utils/recordingStorage.ts`.
3. **Step 1:** Video blob is saved immediately into client IndexedDB (`MAPD_Interview_Recordings_DB`) as an offline backup.
4. **Step 2:** Upload tries direct Convex Storage via `generateUploadUrl` (bypassing Vercel 4.5MB payload limits).
5. **Step 3 (Fallback):** If Convex storage is unavailable, uploads via `POST /api/upload-recording` to Supabase Storage or ImageKit.
6. **Step 4 (Local Disk Fallback):** Node `fs` writes to `public/uploads/recordings/` on local disk.
7. `SaveInterviewRecording` Convex mutation updates `recordingUrl` and `storageProvider` in database.

---

# 13. IMPORTANT CODE EXPLANATION

### 1. Key Code Files & Responsibilities

#### A. `lib/roleInterviewerEngine.ts`
- **Purpose:** Core intelligence module for domain normalization, 8-phase question generation, and adaptive follow-up fallback logic.
- **Key Functions:** `normalizeRole()`, `generateRoleAwareQuestions()`, `generateAdaptiveFollowUp()`.
- **Logic:** Maps raw job titles to normalized categories (`java_developer`, `frontend_developer`, `aiml_engineer`, etc.) and generates structured question arrays spanning 8 distinct evaluation phases.

#### B. `app/api/interview-feedback/route.tsx`
- **Purpose:** Grounded transcript evaluation engine.
- **Key Functions:** `evaluateCandidateAnswers()`, `POST()`.
- **Logic:** Compares candidate spoken transcript against technical topic keywords, detects verbal filler words via regex `/\b(um|uh|like|you know|basically|actually)\b/gi`, computes WPM speaking rate, and calculates an overall score using a transparent weighted formula: Tech (35%) + Problem Solving (25%) + Relevance (15%) + Completeness (15%) + Communication (10%).

#### C. `utils/recordingStorage.ts`
- **Purpose:** Resilient unified video recording storage manager.
- **Key Functions:** `saveRecordingBlob()`, `uploadRecordingToCloud()`, `getRecordingPlaybackUrl()`, `deleteCloudRecording()`.
- **Logic:** Implements offline-first IndexedDB buffering (`MAPD_Interview_Recordings_DB`) combined with direct Convex Cloud Storage uploads via signed URLs to prevent Vercel payload limit failures.

#### D. `utils/facialAnalysis.ts`
- **Purpose:** Client-side real-time computer vision telemetry.
- **Key Functions:** `analyzeVideoFrame()`.
- **Logic:** Draws HTML5 video frame onto offscreen Canvas 2D context (320x240), samples RGB pixels to locate skin color centroid, computes centroid displacement from target image center, and calculates eye contact %, head pose status, stress index, and confidence score.

#### E. `convex/Interview.ts`
- **Purpose:** Serverless database functions for session CRUD and cloud storage URLs.
- **Key Functions:** `SaveInterviewQuestion`, `GetInterviewQuestions`, `UpdateFeedback`, `SaveInterviewRecording`, `GenerateUploadUrl`.
- **Logic:** Manages transactional database updates on `InterviewSessionTable` with server-side authorization validation.

---

# 14. DESIGN DECISIONS

1. **Why Next.js 15 App Router?**
   - *Reason:* Server Components allow fast rendering of static layouts while Client Components handle interactive video streams and speech APIs.
   - *Benefit:* Unified TypeScript codebase for frontend pages and serverless API endpoints.

2. **Why Convex Serverless Database?**
   - *Reason:* Replaces traditional ORMs and manual WebSockets with reactive document storage that updates UI components automatically when data changes.
   - *Trade-Off:* Vendor lock-in to Convex cloud runtime; mitigated by standard JSON schema structure.

3. **Why Web Speech API instead of External Voice APIs (OpenAI Whisper / ElevenLabs)?**
   - *Reason:* Native browser Web Speech API costs $0, has zero latency delay, and works offline without consuming external API credits.
   - *Trade-Off:* Voice quality varies across client browser implementations (Chrome vs Firefox vs Safari).

4. **Why Canvas 2D Pixel Sampling for Vision Telemetry instead of MediaPipe / TensorFlow.js?**
   - *Reason:* Heavy ML models require 50MB+ WebAssembly downloads and cause 100% CPU spikes on low-end candidate laptops. Canvas 2D RGB centroid tracking executes in under 2ms per frame.

5. **Why Multi-Tier Storage (IndexedDB -> Convex -> Supabase -> ImageKit -> Disk)?**
   - *Reason:* Serverless deployment platforms (Vercel) impose a strict 4.5MB request payload limit. Direct Convex cloud upload bypasses Vercel limits while IndexedDB ensures video is never lost even if the candidate loses internet connection mid-interview.

---

# 15. ERROR HANDLING

1. **Frontend Graceful Fallbacks:** If camera or microphone hardware is blocked or unavailable, `app/(routes)/interview/[interviewId]/page.tsx` catches the exception and allows the candidate to proceed in interactive text-based mode.
2. **API Endpoint Error Protection:** All Next.js route handlers are wrapped in `try/catch` blocks returning structured JSON errors (`{ error: "message", status: 500 }`).
3. **Database Client Resilience:** `app/ConvexClientProvider.tsx` validates the Convex URL and falls back to `FallbackProvider` if the database URL is missing or invalid, preventing app crashes.
4. **Adaptive AI Engine Fallback:** If the Gemini 1.5 Flash API times out or fails, `generateAdaptiveFollowUp()` falls back seamlessly to the local rule-based role-intelligence engine.

---

# 16. TESTING

- **Current Implementation:** Manual testing & API verification.
  - Manual verification across Chrome, Edge, and mobile browsers.
  - API endpoint verification via curl and Postman payload testing.
- **Testing Roadmap (Future Improvement):**
  - **Unit Testing:** Add Jest + React Testing Library for testing `roleInterviewerEngine.ts`, `facialAnalysis.ts`, and component rendering.
  - **Integration Testing:** Add Playwright end-to-end tests for interview creation, live session page transitions, and feedback generation.

---

# 17. DEPLOYMENT

- **Hosting Platform:** Deployed on **Vercel** and **Netlify** (`netlify.toml`, `@netlify/plugin-nextjs`, `vercel.json`).
- **Environment Variables:**
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`
  - `GEMINI_API_KEY`
  - `IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_URL_PUBLIC_KEY`, `IMAGEKIT_URL_PRIVATE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `ARCJET_KEY`
- **Build Command:** `npm run build` (runs `next build` compiling TypeScript and CSS assets).

---

# 18. GITHUB & VERSION CONTROL

- **Repository Structure:** Clean root directory with TypeScript configuration, Tailwind PostCSS plugins, App Router, Convex backend, and utility modules.
- **`.gitignore` Protection:** Excludes `node_modules/`, `.next/`, `.env.local`, `out/`, `build/`, and local video uploads (`public/uploads/recordings/*`), ensuring API keys and candidate recordings are never committed to git.

---

# 19. PERFORMANCE OPTIMIZATION

1. **Canvas Frame Downsampling:** Video frame analysis in `utils/facialAnalysis.ts` resizes video input to an offscreen 320x240 canvas and samples every 16th pixel index, reducing frame processing overhead to < 2ms.
2. **Direct Cloud Storage Upload:** Uploading video blobs directly from browser to Convex Storage via signed URLs avoids buffering heavy video payloads in Vercel serverless function memory.
3. **Optimized Asset Delivery:** Next.js Font Optimization automatically loads `Geist` fonts without render-blocking network requests.

---

# 20. SCALABILITY

### Current Monolith / Serverless Architecture vs Future Enterprise Scaling

| Component | Current Implementation | 1,000 Concurrent Users | 100,000 Concurrent Users (Future Architecture) |
| :--- | :--- | :--- | :--- |
| **Frontend / SSR** | Next.js on Vercel / Netlify | Handled automatically by serverless edge CDN | Multi-region CDN edge caching with AWS CloudFront |
| **Database** | Convex Serverless Document DB | Convex auto-scales read queries reactive streams | Dedicated DB sharding, Redis cache layer for session metadata |
| **AI LLM API** | Direct Gemini 1.5 Flash REST API | Within standard API quota tier | Load-balanced LLM pool (Gemini + Claude + Local vLLM cluster) |
| **Video Storage** | Convex Storage & Supabase | Multi-tier cloud handles uploads smoothly | Dedicated AWS S3 / Cloudflare R2 bucket with HLS transcoding |
| **Rate Limiting** | Arcjet Token Bucket in API route | Protects serverless functions from abuse | Distributed API Gateway (Kong / Cloudflare Rate Limiting) |
""")

print("Sections 11 to 20 appended.")
