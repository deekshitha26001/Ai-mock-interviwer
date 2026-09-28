import os
import sys

workspace_dir = r"c:\Users\Deekshitha P\Documents\AI-Mock-Interview-2.0-main"
md_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.md")

print("Appending Sections 2 to 10...")

with open(md_path, "a", encoding="utf-8") as f:
    f.write("""
# 2. COMPLETE TECHNOLOGY STACK

### 1. Technology Master Table

| Technology | Version | Why Used | Where Used | Alternative |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js** | `15.4.10` | Server-Side Rendering (SSR), Client Components, App Router routing, and integrated API routes. | Core framework across `app/` pages, layouts, and `app/api/*` endpoint handlers. | React SPA (Vite), Remix, Express + React |
| **React** | `19.1.0` | Declarative UI rendering, hooks state management, and component architecture. | Client components in `app/(routes)/*`, `components/ui/*`. | Vue.js, Svelte, Angular |
| **TypeScript** | `^5` | Static type safety, strict interface declarations, compile-time bug prevention. | Entire codebase across `.ts` and `.tsx` files. | Plain JavaScript |
| **Convex DB** | `^1.25.4` | Serverless reactive document database, real-time live updates, cloud file storage. | `convex/schema.ts`, `convex/Interview.ts`, `convex/users.ts`. | Firebase Firestore, Supabase PostgreSQL, MongoDB Atlas |
| **Clerk** | `^6.39.7` | Zero-boilerplate user authentication, OAuth providers, session tokens, secure route middleware. | `middleware.ts`, `app/Provider.tsx`, `app/(auth)/*`. | NextAuth.js (Auth.js), Firebase Auth, Supabase Auth |
| **Google Gemini API** | `1.5-flash` | Ultra-fast LLM text generation for real-time adaptive follow-ups and prompt evaluation. | `lib/roleInterviewerEngine.ts`, `app/api/generate-followup-question/route.tsx`. | OpenAI GPT-4o-mini, Anthropic Claude 3.5 Haiku |
| **ImageKit** | `^6.0.0` | Cloud media file storage for PDF resumes and interview recording fallback. | `app/api/generate-interview-questions/route.tsx`, `app/api/upload-recording/route.ts`. | AWS S3, Cloudinary, Firebase Storage |
| **Supabase Storage** | `^2.53.0` | Bucket-based cloud video recording storage (`interview-recordings`). | `app/api/upload-recording/route.ts`, `app/api/delete-recording/route.ts`. | AWS S3, Google Cloud Storage |
| **Arcjet** | `^1.0.0-beta.10` | Rate limiting, bot protection, and token bucket security rules. | `utils/arcjet.ts`, `app/api/generate-interview-questions/route.tsx`, `app/api/arcjet/route.ts`. | Upstash Redis Rate Limit, Cloudflare WAF |
| **Tailwind CSS** | `^4` | Utility-first CSS styling, responsive grid layouts, dark mode variables. | `app/globals.css`, `tailwind.config.ts`, component inline classes. | Vanilla CSS, Bootstrap, Styled Components |
| **Shadcn UI / Radix** | `1.1-1.2` | Accessible unstyled UI primitives (Dialog, Tabs, Slot) customized with Tailwind. | `components/ui/*` (dialog.tsx, tabs.tsx, button.tsx). | Material UI (MUI), Ant Design, Chakra UI |
| **Web Speech API** | Native Browser | Zero-cost browser speech synthesis (TTS) and speech recognition (STT). | `app/(routes)/interview/[interviewId]/start/page.tsx`, `utils/interviewerConfig.ts`. | OpenAI Whisper API, ElevenLabs Voice API |
| **Canvas 2D API** | Native Browser | Real-time HTML5 webcam frame sampling for posture & eye contact telemetry. | `utils/facialAnalysis.ts`, `app/(routes)/interview/[interviewId]/start/page.tsx`. | MediaPipe, TensorFlow.js, OpenCV.js |
| **IndexedDB** | Native Browser | Client-side persistent storage for offline video recording buffers before cloud upload. | `utils/recordingStorage.ts` (`MAPD_Interview_Recordings_DB`). | LocalStorage, SessionStorage |
| **Lucide React** | `^0.536.0` | Modern SVG iconography. | Used across all UI pages and components. | Heroicons, FontAwesome |
| **Sonner** | `^2.0.7` | Custom toast notifications for async API updates. | Used across dashboard, preparation, and live session pages. | React Toastify, Hot Toast |
| **Next-Themes** | `^0.4.6` | Client-side dark mode theme switching without layout flash. | `app/layout.tsx`, `app/_components/ThemeToggle.tsx`. | Manual CSS class toggling |

---

### 2. Technology Breakdown & Interview Answers

#### A. Next.js 15 (App Router)
1. **What is it?** Next.js is a full-stack React framework that provides server-side rendering, static site generation, serverless API routes, and optimized file-system routing via the App Router.
2. **Why was it selected?** It allows seamless integration of server components, API endpoints, and client-side reactive components in a unified TypeScript codebase, eliminating the need for a separate backend server.
3. **Where is it used?** Used for the entire project structure in `app/`, managing page layouts (`layout.tsx`), page routes (`page.tsx`), serverless endpoints (`app/api/*`), and middleware (`middleware.ts`).
4. **What problem does it solve?** Solves CORS issues between frontend and backend, optimizes client bundle size via Server Components, and provides fast initial page loads with SSR.
5. **Alternatives:** Vite + Express.js, Remix, Nuxt.js.
6. **Interview Question:** *"Why use Next.js App Router over traditional React SPA with Client-Side Routing?"*
7. **Interview-Ready Answer:** *"Next.js App Router provides Server Components by default, which reduces the JavaScript payload sent to the browser. It also unifies backend API routes and frontend pages in one project, simplifying deployment and eliminate cross-origin CORS complexity."*

#### B. Convex Database
1. **What is it?** Convex is a serverless reactive document database built for web applications that provides real-time state synchronization, file storage, and serverless TypeScript functions.
2. **Why was it selected?** It eliminates database connection pooling overhead and allows instantaneous UI updates whenever interview records or feedback data change.
3. **Where is it used?** Defined in `convex/schema.ts` (`UserTable`, `InterviewSessionTable`) and executed in `convex/Interview.ts` and `convex/users.ts`.
4. **What problem does it solve?** Replaces traditional ORM database boilerplate (Prisma/TypeORM) and WebSocket setup with reactive TypeScript queries (`useQuery`) and mutations (`useMutation`).
5. **Alternatives:** Firebase Firestore, Supabase PostgreSQL, MongoDB Atlas.
6. **Interview Question:** *"How does Convex handle real-time data sync compared to traditional REST polling?"*
7. **Interview-Ready Answer:** *"Convex uses persistent WebSocket connections to stream query updates to the client. Whenever a mutation patches a record in `InterviewSessionTable`, all subscribed `useQuery` hooks automatically re-render with fresh data without manual HTTP polling."*

#### C. Clerk Authentication
1. **What is it?** Clerk is an end-to-end user management and authentication service for modern web applications.
2. **Why was it selected?** Provides production-ready sign-in/sign-up components, JWT session token management, and simple Next.js middleware protection.
3. **Where is it used?** Configured in `middleware.ts`, wrapped in `app/ConvexClientProvider.tsx` and `app/Provider.tsx`, and used in `app/(auth)/*`.
4. **What problem does it solve?** Eliminates the risk of implementing password hashing, OAuth login flow, or JWT cookie expiration manually.
5. **Alternatives:** NextAuth.js (Auth.js), Supabase Auth, Firebase Auth.
6. **Interview Question:** *"How is user data synchronized between Clerk and your database?"*
7. **Interview-Ready Answer:** *"In `app/Provider.tsx`, a `useEffect` hook triggers whenever Clerk's `useUser` context loads. It calls the Convex mutation `CreateNewUser`, passing the candidate's email, name, and profile image. The mutation checks if the user exists in `UserTable` by email; if not, it inserts a new record and returns the database ID."*

---

# 3. PROJECT ARCHITECTURE

### 1. High-Level System Architecture

The application follows a modern **Serverless Monolith with Event-Driven AI & Multi-Storage Tier** architecture:

```
[ User Browser ]
   │
   ├── (1) HTTP / HTML / JS Bundle ──► [ Next.js 15 App Router on Vercel / Netlify ]
   │
   ├── (2) Auth Session Tokens ─────► [ Clerk Authentication Engine ]
   │
   ├── (3) Live Reactive WebSockets ─► [ Convex Serverless DB & Object Storage ]
   │
   ├── (4) REST API Calls ──────────► [ Next.js API Routes (app/api/*) ]
   │                                     │
   │                                     ├──► [ Google Gemini 1.5 Flash API ]
   │                                     ├──► [ ImageKit Cloud Media API ]
   │                                     ├──► [ Supabase Object Storage ]
   │                                     └──► [ Arcjet Token Bucket Security ]
   │
   └── (5) Browser Subsystems
         ├── Web Speech API (TTS Persona Voice & STT Voice Transcription)
         ├── HTML5 Canvas 2D Context (Real-Time Vision & Posture Telemetry)
         └── IndexedDB (Local Video Recording Buffer Backup)
```

---

### 2. Request-Response Execution Flow

Here is the exact internal trace when a candidate performs the primary action: **Creating and Completing an Interview Session**:

```
Candidate Fills Interview Form
   │
   ▼ (Form Submit with Role & Tech Stack)
[ CreateInterviewDialog.tsx ]
   │
   ▼ (POST multipart/form-data)
[ app/api/generate-interview-questions/route.tsx ]
   │
   ├──► Arcjet Rate Limit Check (aj.protect)
   ├──► ImageKit PDF Resume Upload (if file attached)
   └──► Call roleInterviewerEngine.ts -> generateRoleAwareQuestions()
   │
   ▼ (Returns 8-Phase Questions Array)
[ SaveInterviewQuestion Mutation in convex/Interview.ts ]
   │
   ▼ (Inserts record into InterviewSessionTable with status 'draft')
Redirect Candidate to [ app/(routes)/interview/[interviewId]/page.tsx ]
   │
   ▼ (Device Readiness Check: Cam & Mic)
Candidate Clicks "Start Interview" -> Navigates to [ .../start/page.tsx ]
   │
   ├──► Web Speech API speaks Phase 1 Intro ("Tell me about yourself")
   ├──► Canvas 2D Vision Telemetry loops frame sampling @ 1.2s interval
   ├──► MediaRecorder captures video stream to IndexedDB buffer
   │
   ▼ (Candidate speaks answer & clicks "Next Question")
[ app/api/generate-followup-question/route.tsx ]
   │
   ├──► Calls Gemini 1.5 Flash API (evaluates response & probes tech stack)
   └──► Fallback: Role Intelligence Engine (pivots if candidate struggled)
   │
   ▼ (All 8 Questions Completed -> Click "End Call")
[ uploadRecordingToCloud() in utils/recordingStorage.ts ]
   │
   ├──► Direct Convex Storage Upload / Supabase / ImageKit / Server Disk
   └──► SaveInterviewRecording Mutation in convex/Interview.ts
   │
   ▼ (POST candidate answers to app/api/interview-feedback/route.tsx)
[ evaluateCandidateAnswers() ]
   │
   ├──► Grounded transcript technical scoring & evidence quotes
   ├──► Filler word regex parsing & speaking WPM calculation
   └──► Weighted formula: Tech(35%) + Prob(25%) + Rel(15%) + Comp(15%) + Comm(10%)
   │
   ▼ (UpdateFeedback Mutation in convex/Interview.ts)
Patches record with feedback JSON & sets status to 'complete'
   │
   ▼ (Redirect Candidate)
[ app/(routes)/interview/[interviewId]/feedback/page.tsx ]
```

---

# 4. SYSTEM ARCHITECTURE DIAGRAMS

### 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                    |
|  +------------------+  +-------------------+  +--------------------------------+  |
|  | Next.js App UI   |  | Web Speech API    |  | Canvas 2D Computer Vision      |  |
|  | (React 19)       |  | (Voice Synthesis) |  | (Centroid & Stress Telemetry) |  |
|  +--------+---------+  +---------+---------+  +---------------+----------------+  |
+-----------|----------------------|----------------------------|-------------------+
            |                      |                            |
            | HTTP / WebSockets    | Voice Output               | Frame Samples
            v                      v                            v
+-----------------------------------------------------------------------------------+
|                                SERVERLESS BACKEND                                 |
|  +-----------------------------------+  +--------------------------------------+  |
|  | Next.js API Routes (app/api/*)    |  | Convex Serverless Functions          |  |
|  | - generate-interview-questions    |  | - SaveInterviewQuestion              |  |
|  | - generate-followup-question      |  | - GetInterviewQuestions              |  |
|  | - interview-feedback              |  | - UpdateFeedback                     |  |
|  | - upload-recording                |  | - SaveInterviewRecording             |  |
|  +-----------------+-----------------+  +------------------+-------------------+  |
+--------------------|---------------------------------------|----------------------+
                     |                                       |
                     v External API Calls                    v DB Reactive Stream
+-----------------------------------------------------------------------------------+
|                             EXTERNAL SERVICES & DATABASE                          |
|  +-------------------+  +--------------------+  +------------------------------+  |
|  | Google Gemini     |  | Convex Document    |  | Storage Providers            |  |
|  | 1.5 Flash API     |  | Database           |  | (Convex / Supabase / IK)     |  |
|  +-------------------+  +--------------------+  +------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

# 5. COMPLETE FOLDER STRUCTURE

```
ai-mock-interview-2.0/
├── .env.example                       # Environment variables template file
├── .env.local                         # Local environment API keys (Clerk, Convex, Gemini, ImageKit, Arcjet)
├── .gitignore                         # Version control exclusion rules (node_modules, .next, .env)
├── components.json                    # Shadcn UI configuration mapping
├── middleware.ts                      # Clerk authentication middleware route protection
├── netlify.toml                       # Netlify build and plugin deployment configuration
├── next.config.ts                     # Next.js framework configuration options
├── package.json                       # Project dependencies and script declarations
├── postcss.config.mjs                 # PostCSS configuration for Tailwind CSS v4
├── tailwind.config.ts                 # Tailwind CSS design system tokens
├── tsconfig.json                      # TypeScript compiler configuration
├── vercel.json                        # Vercel deployment serverless routing configuration
│
├── app/                               # Next.js 15 App Router core directory
│   ├── layout.tsx                     # Root application layout with Clerk & Convex providers
│   ├── page.tsx                       # Landing page rendering Header and Hero components
│   ├── globals.css                    # Tailwind CSS v4 directives and theme variables
│   ├── Provider.tsx                   # User context provider syncing Clerk user to Convex DB
│   ├── ConvexClientProvider.tsx       # Client-side ConvexReactClient initializer with fallback
│   │
│   ├── (auth)/                        # Clerk Authentication Routes Group
│   │   ├── sign-in/                   # Sign-in page component
│   │   └── sign-up/                   # Sign-up page component
│   │
│   ├── (routes)/                      # Protected Application Route Group
│   │   ├── layout.tsx                 # Protected route layout
│   │   ├── dashboard/                 # Candidate dashboard page
│   │   │   ├── page.tsx               # Dashboard view with metrics, filters, and interview list
│   │   │   └── _components/           # Dashboard subcomponents
│   │   │       ├── EmptyState.tsx         # Rendered when candidate has 0 interviews
│   │   │       ├── InterviewCard.tsx      # Individual interview summary card with actions
│   │   │       ├── ProgressAnalytics.tsx  # Interactive score trajectory and analytics charts
│   │   │       ├── SavedFlashcards.tsx    # Saved technical flashcard review modal
│   │   │       └── FeedbackDialog.tsx     # Quick feedback summary dialog
│   │   │
│   │   ├── interview/                 # Interview Session Routes
│   │   │   └── [interviewId]/         # Dynamic interview instance folder
│   │   │       ├── page.tsx           # Step 2: Readiness check, cam/mic test & interviewer choice
│   │   │       ├── start/             # Step 3: Live interactive speech interview session
│   │   │       │   ├── page.tsx       # Core session engine with camera, voice, and Gemini AI
│   │   │       │   └── _components/   # Session subcomponents
│   │   │       │       ├── AudioVisualizer.tsx  # Dynamic speech audio waveform visualizer
│   │   │       │       ├── QuestionTimer.tsx    # Question countdown and duration tracker
│   │   │       │       └── VoiceSettings.tsx    # Speech rate and voice selection controls
│   │   │       ├── feedback/          # Step 4: Comprehensive feedback & transcript report
│   │   │       │   ├── page.tsx       # Detailed scoring, filler analytics, STAR answers
│   │   │       │   └── _components/   # RadarChart.tsx for multi-skill radar chart
│   │   │       ├── playback/          # Step 5: Full interview video recording playback page
│   │   │       │   └── page.tsx       # Video player with timestamped question bookmarks
│   │   │       └── recruiter-report/  # Recruiter Shareable Candidate Assessment Report
│   │   │           └── page.tsx       # Executive hiring decision report for recruiters
│   │   │
│   │   ├── questions/                 # Question Bank page (`page.tsx`)
│   │   ├── upgrade/                   # Membership subscription upgrade page (`page.tsx`)
│   │   └── how-it-works/              # Platform walkthrough guide page (`page.tsx`)
│   │
│   ├── _components/                   # Shared Application Layout Components
│   │   ├── Header.tsx                 # Responsive navigation header with Clerk user button
│   │   ├── Hero.tsx                   # Main landing page hero section with CTA buttons
│   │   ├── MAPDLogo.tsx               # Custom SVG branding logo
│   │   └── ThemeToggle.tsx            # Light/Dark mode toggle button
│   │
│   └── api/                           # Next.js Serverless API Route Handlers
│       ├── generate-interview-questions/route.tsx  # Creates 8-phase questions & uploads resume
│       ├── generate-followup-question/route.tsx   # Dynamic Gemini 1.5 Flash adaptive follow-ups
│       ├── interview-feedback/route.tsx           # Grounded transcript evaluation & scoring
│       ├── upload-recording/route.ts              # Multi-tier video storage upload endpoint
│       ├── delete-recording/route.ts              # Permanent video deletion handler
│       ├── akool-session/route.ts                 # Akool live avatar session initializer
│       ├── akool-knowledge-base/route.ts          # Akool knowledge base creator endpoint
│       └── arcjet/route.ts                        # Arcjet rate-limiting test handler
│
├── convex/                            # Convex Serverless Database Functions & Schemas
│   ├── schema.ts                      # Database table definitions (UserTable, InterviewSessionTable)
│   ├── Interview.ts                   # Queries & Mutations for session CRUD & storage URLs
│   └── users.ts                       # Mutation for user creation and lookup (`CreateNewUser`)
│
├── context/                           # React Context Providers
│   └── UserDetailContext.tsx          # Global context storing current logged-in user details
│
├── lib/                               # Core Business Logic & AI Engines
│   ├── roleInterviewerEngine.ts       # 8-phase question generator & rule-based adaptive follow-up
│   └── utils.ts                       # Tailwind class merging utility (`cn`)
│
└── utils/                             # Utility Helper Libraries
    ├── arcjet.ts                      # Arcjet token bucket security rules setup
    ├── facialAnalysis.ts              # Canvas 2D real-time posture & vision telemetry
    ├── interviewerConfig.ts           # Male/Female interviewer voice configs & selection
    └── recordingStorage.ts            # IndexedDB buffer & multi-cloud upload pipeline
```
""")

print("Sections 2 to 5 appended.")
