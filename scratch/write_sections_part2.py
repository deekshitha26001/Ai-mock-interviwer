import os

workspace_dir = r"c:\Users\Deekshitha P\Documents\AI-Mock-Interview-2.0-main"
md_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.md")

print("Appending Sections 6 to 10...")

with open(md_path, "a", encoding="utf-8") as f:
    f.write("""
# 6. FRONTEND DEEP EXPLANATION

### 1. Framework & Route Architecture
The frontend is built on **Next.js 15 App Router** and **React 19**, leveraging TypeScript for strict component prop contracts. Routes are organized into functional route groups:

- **Public Routes:** `/` (Landing page), `/sign-in`, `/sign-up`, `/questions`, `/upgrade`, `/how-it-works`.
- **Protected Routes:** `/dashboard`, `/interview/[interviewId]`, `/interview/[interviewId]/start`, `/interview/[interviewId]/feedback`, `/interview/[interviewId]/playback`, `/interview/[interviewId]/recruiter-report`.

### 2. Key Pages Breakdown

#### A. Landing Page (`app/page.tsx`)
- **Purpose:** Public marketing homepage introducing MAPD platform features.
- **Components Used:** `Header.tsx`, `Hero.tsx`, `MAPDLogo.tsx`, `ThemeToggle.tsx`.
- **Data Used:** Static hero text, feature badges, call-to-action redirect links.
- **User Actions:** Click "Get Started" or "Sign In" -> Redirects to Clerk auth / Dashboard.

#### B. Candidate Dashboard (`app/(routes)/dashboard/page.tsx`)
- **Purpose:** Central management hub for candidates to view metrics, search past sessions, and create new interview sessions.
- **Components Used:** `CreateInterviewDialog.tsx`, `InterviewCard.tsx`, `ProgressAnalytics.tsx`, `SavedFlashcards.tsx`, `EmptyState.tsx`, `Input`.
- **Data Used:** Reactive `useQuery(api.Interview.GetInterviewList)` streaming session objects from Convex `InterviewSessionTable`.
- **User Actions:**
  - Filter session cards by role, completion status, or minimum score rating.
  - Open `CreateInterviewDialog` to submit job title, job description, tech stack, experience level, and optional PDF resume.
  - Launch active interview session or view past feedback/playback.

#### C. Interview Readiness Check (`app/(routes)/interview/[interviewId]/page.tsx`)
- **Purpose:** Step 2 setup page where candidates test webcam/mic hardware and select their preferred AI interviewer persona.
- **Components Used:** Video preview element, device status indicators, persona selector cards (`Alex Vance` vs `Sarah Jenkins`), `Button`, `Badge`.
- **Data Used:** `useQuery(api.Interview.GetInterviewQuestions)` retrieving session details and current interviewer selection.
- **User Actions:**
  - Click "Enable Camera & Microphone" -> Invokes browser `navigator.mediaDevices.getUserMedia`.
  - Select Male or Female AI Interviewer -> Persists selection to Convex via `UpdateInterviewerGender` mutation.
  - Click "Start Interview" -> Navigates to `/start` page.

#### D. Live Interactive Interview Session (`app/(routes)/interview/[interviewId]/start/page.tsx`)
- **Purpose:** Core interview execution screen where the AI interviewer asks questions, tracks speech, records video, and performs real-time vision telemetry.
- **Components Used:** `AudioVisualizer.tsx`, `QuestionTimer.tsx`, `VoiceSettings.tsx`, Video element, Chat message stream, controls (`Mic`, `Camera`, `End Call`).
- **Data Used:** Local state for 8-phase question list, speech transcripts, canvas metrics, and MediaRecorder stream chunks.
- **User Actions:**
  - Speak response into microphone -> Web Speech API updates `candidateAnswers` state.
  - Click "Next Question" -> Calls `/api/generate-followup-question` for Gemini adaptive follow-up.
  - Click "End Call" -> Uploads recording via `uploadRecordingToCloud()`, calls `/api/interview-feedback` for transcript scoring, patches Convex record, and redirects to feedback page.

#### E. Detailed Feedback & Transcript Evaluation (`app/(routes)/interview/[interviewId]/feedback/page.tsx`)
- **Purpose:** Comprehensive post-interview breakdown providing technical score, filler analytics, STAR model answers, and improvement suggestions.
- **Components Used:** `RadarChart.tsx`, Score summary metrics, Accordion list of individual question evaluations, Video playback link.
- **Data Used:** `record.feedback` object populated by feedback API route.

---

# 7. BACKEND DEEP EXPLANATION

### 1. Framework & Route Handlers
The backend operates as a serverless architecture combining **Next.js API Route Handlers** (`app/api/*`) for stateless external API processing and **Convex Serverless Database Functions** (`convex/*.ts`) for transactional database state mutations and reactive queries.

### 2. Complete API Endpoints Table

| Method | Endpoint | Purpose | Request Body / Payload | Response Structure | Auth Required? | Database Operation | Key Files |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/generate-interview-questions` | Generates 8-phase questions & uploads resume. | FormData (`file`, `jobTitle`, `jobDescription`, `techStack`, `experienceLevel`) | `{ questions: [], resumeUrl: string, status: 200 }` | Yes (Clerk) | Inserts session record via Convex `SaveInterviewQuestion` | `route.tsx`, `lib/roleInterviewerEngine.ts` |
| `POST` | `/api/generate-followup-question` | Generates Gemini 1.5 Flash adaptive follow-up. | JSON `{ currentQuestion, candidateAnswer, jobTitle, techStack, currentPhase }` | `{ hasFollowUp: boolean, followUpQuestion: string, detectedKeywords: [] }` | Optional | None (Stateless LLM call with rule fallback) | `route.tsx`, `lib/roleInterviewerEngine.ts` |
| `POST` | `/api/interview-feedback` | Evaluates spoken transcript & calculates score. | JSON `{ candidateAnswers: [], jobTitle, techStack, durationSeconds }` | Complete Evaluation JSON (Rating, TechScore, Fillers, STAR Answers) | Optional | Patches session via Convex `UpdateFeedback` | `route.tsx` |
| `POST` | `/api/upload-recording` | Uploads video blob to cloud storage. | FormData (`file`, `interviewId`, `durationSeconds`) | `{ recordingUrl, recordingId, storageProvider, status: 200 }` | Yes (Clerk) | Saves URL via Convex `SaveInterviewRecording` | `route.ts`, `utils/recordingStorage.ts` |
| `POST` | `/api/delete-recording` | Permanently deletes recording file. | JSON `{ recordingUrl, recordingId, storageProvider }` | `{ status: 200, message: string, deletedFromCloud: boolean }` | Yes (Clerk) | Clears URL via Convex `DeleteInterviewRecording` | `route.ts` |
| `POST` | `/api/akool-session` | Creates live avatar streaming session. | JSON `{ avatar_id, kb_id }` | `{ code: 1000, data: { session_id, token } }` | Internal Key | None | `route.ts` |
| `POST` | `/api/akool-knowledge-base` | Creates Akool knowledge base from questions. | JSON `{ questions: [] }` | `{ code: 1000, data: { knowledge_id } }` | Internal Key | None | `route.ts` |

---

# 8. DATABASE DEEP DIVE

### 1. Database Technology
The application utilizes **Convex**, a serverless reactive document database. Data structures are defined strictly in `convex/schema.ts` using `defineSchema` and `defineTable`.

### 2. Schema Structure & Entity Definitions

#### A. `UserTable`
Stores synced Clerk user profile records:
- `_id`: Convex Document ID (Primary Key).
- `name`: string — Candidate full name.
- `email`: string — Candidate primary email address.
- `imageUrl`: string — Candidate profile avatar URL.

#### B. `InterviewSessionTable`
Stores technical mock interview session instances:
- `_id`: Convex Document ID (Primary Key).
- `userId`: `v.id('UserTable')` — Foreign Key reference to `UserTable`.
- `status`: string — Session lifecycle state (`'draft'` or `'complete'`).
- `jobTitle`: union(string, null) — Target position title.
- `jobDescription`: union(string, null) — Provided job description text.
- `techStack`: optional(union(string, null)) — Target technology stack.
- `experienceLevel`: optional(union(string, null)) — Candidate experience bracket.
- `interviewQuestions`: v.any() — Array of 8-phase generated question objects.
- `feedback`: optional(v.any()) — Complete evaluation JSON report.
- `resumeUrl`: union(string, null) — ImageKit HTTPS URL for candidate resume PDF.
- `recordingUrl`: optional(union(string, null)) — HTTPS playback URL for video recording.
- `recordingId`: optional(union(string, null)) — Cloud object storage file identifier.
- `storageProvider`: optional(union(string, null)) — Provider tag (`'convex'`, `'supabase'`, `'imagekit'`, `'server'`).
- `interviewerGender`: optional(union(string, null)) — Persona choice (`'male'` or `'female'`).

### 3. Database ER Diagram (Mermaid)

```mermaid
erDiagram
    UserTable ||--o{ InterviewSessionTable : "creates and owns"
    UserTable {
        string _id PK
        string name
        string email
        string imageUrl
    }
    InterviewSessionTable {
        string _id PK
        string userId FK
        string status
        string jobTitle
        string jobDescription
        string techStack
        string experienceLevel
        json interviewQuestions
        json feedback
        string resumeUrl
        string recordingUrl
        string storageProvider
        string interviewerGender
    }
```

---

# 9. AUTHENTICATION & SECURITY

### 1. Clerk Authentication Architecture
- **Middleware Protection (`middleware.ts`):** All incoming requests except explicitly declared public routes (`/`, `/sign-in`, `/sign-up`, `/questions`, `/upgrade`, `/how-it-works`) are intercepted by `clerkMiddleware()` and protected via `auth.protect()`. Unauthenticated users are redirected to `/sign-in`.
- **Database User Synchronization (`Provider.tsx`):** On initial page load, `ProviderInner` consumes `useUser()` from Clerk. When a user is detected, it triggers the Convex mutation `CreateNewUser`, ensuring user state remains synced between Clerk Auth and Convex DB.
- **Server Authorization Verification:** Serverless Convex functions (`Interview.ts`) enforce ownership checks (`if (args.uid && record.userId !== args.uid) throw new Error("Unauthorized")`).

### 2. Arcjet Security Integration (`utils/arcjet.ts`)
- **Token Bucket Algorithm:** Implements rate limiting configured to refill 5 tokens every 5 seconds up to a maximum capacity of 10 tokens per user ID or IP address.
- **DDoS & Scraping Protection:** API endpoints like `/api/generate-interview-questions` execute `aj.protect(req)` to prevent abuse and API credit exhaustion.

---

# 10. AI / MACHINE LEARNING FEATURES

### 1. Google Gemini 1.5 Flash API Integration
- **Model:** `gemini-1.5-flash` via HTTP REST API endpoint (`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`).
- **Prompt Engineering Strategy:** Uses structured JSON mode (`responseMimeType: "application/json"`) with a system persona instruction to act as a professional technical interviewer, evaluate spoken input, probe mentioned technologies, or pivot when candidates struggle.

### 2. Role-Aware 8-Phase Interview Engine (`lib/roleInterviewerEngine.ts`)
- **Domain Normalization (`normalizeRole`):** Normalizes user input into standard engineering categories (Java Developer, Python Developer, Frontend Developer, AI/ML Engineer, Data Analyst, DevOps, Security, QA).
- **8-Phase Question Generator (`generateRoleAwareQuestions`):**
  - **Phase 1: Intro** (Background & candidate summary)
  - **Phase 2: Fundamentals** (Role-specific easy concepts)
  - **Phase 3: Intermediate** (Framework mechanics & state management)
  - **Phase 4: Practical & Coding** (Logic, queries, or data preprocessing)
  - **Phase 5: Project Walkthrough** (Candidate project deep-dive)
  - **Phase 6: Resume & Stack** (Specific library implementation)
  - **Phase 7: Real-World Scenarios** (Production troubleshooting)
  - **Phase 8: HR & STAR** (Behavioral strengths & team challenges)

### 3. Canvas 2D Computer Vision Telemetry (`utils/facialAnalysis.ts`)
- **Methodology:** Performs client-side Canvas 2D pixel sampling (`getImageData`) from the candidate's webcam feed at a 1.2-second interval.
- **Metrics Calculated:**
  - **Skin Pixel RGB Centroid:** Tracks face center displacement from target image center.
  - **Eye Contact Percentage:** $100 - (\text{Displacement} \times 45)$, bounded between 65% and 98%.
  - **Head Pose Status:** Maps displacement to "Centered", "Slight Tilt", or "Looking Away".
  - **Perceived Luminance:** Calculates $0.299R + 0.587G + 0.114B$ across pixels to flag "Too Dark" or "Overexposed" lighting.
  - **Stress & Confidence Proxy:** Motion displacement variance calculates dynamic stress index and confidence score.
""")

print("Sections 6 to 10 appended.")
