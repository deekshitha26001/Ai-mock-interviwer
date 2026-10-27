# -*- coding: utf-8 -*-
"""
Content Part 1: Chapters 1 to 5
"""

CHAPTER_1_5 = """
<!-- ========================================== -->
<!-- CHAPTER 1: PROJECT INTRODUCTION -->
<!-- ========================================== -->
<h1 id="ch1">CHAPTER 1: PROJECT INTRODUCTION &amp; PROBLEM STATEMENT</h1>

<h2>1.1 What is MAPD AI Mock Interview?</h2>
<p>
    <strong>MAPD AI Mock Interview 2.0</strong> is an intelligent, full-stack web application designed to help job seekers practice realistic technical and behavioral job interviews. Built with modern web standards, the platform simulates an actual hiring manager interview by combining voice interaction, real-time posture/eye-contact feedback, adaptive artificial intelligence follow-ups, and transcript-grounded performance evaluation.
</p>
<p>
    The acronym <strong>MAPD</strong> stands for <em>Mock AI Placement &amp; Development</em>. It transforms passive interview preparation (such as memorizing static textbook answers) into an active, immersive simulation where candidates speak out loud to an AI interviewer persona, receive follow-up probes based on their exact answers, and obtain an actionable performance scorecard graded against standard industry benchmarks like the <strong>STAR methodology</strong> (Situation, Task, Action, Result).
</p>

<h2>1.2 Why is it Needed? What Problem Does it Solve?</h2>
<p>
    Engineering students and job seekers face significant hurdles when preparing for technical placements:
</p>
<ul>
    <li><strong>High Cost of Professional Coaching:</strong> Human mock interview services (like Interviewing.io or Pramp) charge between $100 and $250 per hour, making frequent practice inaccessible for most college students.</li>
    <li><strong>Passive Learning Inefficacy:</strong> Reading code or memorizing questions does not prepare candidates for the pressure of speaking fluently, maintaining composure, and explaining technical architectures under time constraints.</li>
    <li><strong>Lack of Objective, Immediate Feedback:</strong> Peer practice often results in subjective, unhelpful advice ("You did okay"). Candidates rarely learn their exact filler-word count (saying <em>"um"</em>, <em>"like"</em>, <em>"you know"</em>), technical depth score, or how to structure answers using the STAR method.</li>
    <li><strong>Generic, One-Size-Fits-All Questions:</strong> Most online quizzes ask generic questions regardless of whether the candidate is applying for a Frontend Developer, Backend Spring Boot Engineer, DevOps Specialist, or Data Scientist.</li>
</ul>

<div class="callout callout-viva">
    <div class="callout-title">💡 Viva Voice Pitch (Memorize this for your examiners):</div>
    <em>"My project is an AI Mock Interview platform that bridges the gap between passive learning and real-world placement interviews. It dynamically generates an 8-phase structured technical interview based on the candidate's target job role and resume, conducts the session in real-time using browser speech synthesis and recognition, monitors camera posture and eye-contact, asks adaptive follow-ups using Google Gemini 1.5 Flash, and delivers a zero-hallucination scorecard with verbal filler analysis and model STAR answers."</em>
</div>

<h2>1.3 Who Can Use This System?</h2>
<ol>
    <li><strong>College Students &amp; Freshers:</strong> Preparing for on-campus placements, building verbal confidence, and practicing entry-level software engineering fundamentals.</li>
    <li><strong>Experienced Engineers:</strong> Practicing system design scenarios, cloud architecture questions, and behavioral leadership rounds.</li>
    <li><strong>College Placement Cells &amp; Bootcamps:</strong> Automating large-scale student placement readiness assessments without needing hundreds of human evaluators.</li>
    <li><strong>Technical Recruiters:</strong> Reviewing recorded candidate interviews and automated scorecards before scheduling final round panel interviews.</li>
</ol>

<h2>1.4 Implemented Features vs. Planned Extensions</h2>
<table>
    <thead>
        <tr>
            <th>Feature Area</th>
            <th>Implemented &amp; Verified in Source Code</th>
            <th>Implementation Details / Source Location</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Authentication</strong></td>
            <td>Clerk OAuth (Google / Email) + Session Tokens</td>
            <td><code>middleware.ts</code>, <code>app/Provider.tsx</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Role-Aware Questions</strong></td>
            <td>13 Engineering Domains + 8-Phase Progression Engine</td>
            <td><code>lib/roleInterviewerEngine.ts</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Resume Parsing</strong></td>
            <td>PDF Upload to ImageKit Cloud Storage with unique ID</td>
            <td><code>app/api/generate-interview-questions/route.tsx</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Voice Persona (TTS)</strong></td>
            <td>Male / Female Speech Synthesis via Web Speech API</td>
            <td><code>utils/interviewerConfig.ts</code>, <code>start/page.tsx</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Speech-to-Text (STT)</strong></td>
            <td>Continuous Real-time Speech Recognition in browser</td>
            <td><code>window.webkitSpeechRecognition</code> in <code>start/page.tsx</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Adaptive AI Probing</strong></td>
            <td>Google Gemini 1.5 Flash REST API + Keyword Fallback</td>
            <td><code>app/api/generate-followup-question/route.tsx</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Vision &amp; Posture</strong></td>
            <td>Canvas 2D skin centroid &amp; luminance sampling (&lt;2ms)</td>
            <td><code>utils/facialAnalysis.ts</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Dual-Tier Recording</strong></td>
            <td>IndexedDB offline buffer + Supabase / Convex cloud storage</td>
            <td><code>utils/recordingStorage.ts</code>, <code>upload-recording/route.ts</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Transcript Feedback</strong></td>
            <td>Deterministic scoring: Tech, Relevance, Fillers, STAR</td>
            <td><code>app/api/interview-feedback/route.tsx</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Synchronized Playback</strong></td>
            <td>Timestamped question jump controls on recorded video</td>
            <td><code>app/(routes)/interview/[interviewId]/playback/page.tsx</code></td>
            <td><strong style="color: #16a34a;">Fully Implemented</strong></td>
        </tr>
        <tr>
            <td><strong>Streaming Video Avatar</strong></td>
            <td>Akool WebRTC Live Avatar SDK endpoints</td>
            <td><code>app/api/akool-session/route.ts</code></td>
            <td><strong style="color: #d97706;">Partially Configured</strong> (Optional)</td>
        </tr>
    </tbody>
</table>

<h2>1.5 Benefits &amp; Current Limitations</h2>
<p>
    <strong>Core Engineering Strengths:</strong>
</p>
<ul>
    <li><strong>Zero Latency Speech &amp; Vision:</strong> Because speech recognition, text-to-speech, and face tracking run inside the user's browser, there is zero per-minute audio streaming cost and no server network lag.</li>
    <li><strong>Zero-Hallucination Feedback:</strong> The post-interview evaluation uses deterministic transcript matching rather than trusting a black-box LLM to make up scores. If the candidate never spoke a keyword, it is flagged as missing.</li>
    <li><strong>High Reliability with Fallback Systems:</strong> If the Gemini API key runs out of quota, the system falls back to a deterministic 13-domain role engine without breaking the user's interview.</li>
</ul>
<p>
    <strong>Honest Academic Limitations:</strong>
</p>
<ul>
    <li><strong>Browser Dependency:</strong> Speech recognition relies on Chrome's <code>webkitSpeechRecognition</code> engine. Firefox does not natively support this API.</li>
    <li><strong>Simplified Vision Heuristics:</strong> The posture tracking uses fast HTML5 Canvas 2D RGB skin pixel centroids rather than a heavy neural network like MediaPipe or OpenCV.</li>
</ul>

<!-- ========================================== -->
<!-- CHAPTER 2: COMPLETE TECHNOLOGY STACK -->
<!-- ========================================== -->
<h1 id="ch2">CHAPTER 2: COMPLETE TECHNOLOGY STACK REFERENCE</h1>

<p>
    A critical requirement of a software engineering viva is demonstrating precise knowledge of every library and tool used in your application. Below is the verified technology stack table followed by an exhaustive breakdown of each tool.
</p>

<table>
    <thead>
        <tr>
            <th>Technology</th>
            <th>Exact Version</th>
            <th>Category</th>
            <th>Primary Responsibility in MAPD</th>
            <th>Alternative</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Next.js</strong></td>
            <td><code>15.4.10</code></td>
            <td>Full-Stack Framework</td>
            <td>App Router pages, Server Components, Serverless API Routes</td>
            <td>Remix, Vite + Express</td>
        </tr>
        <tr>
            <td><strong>React</strong></td>
            <td><code>19.1.0</code></td>
            <td>UI Library</td>
            <td>Declarative component rendering, state hooks, and virtual DOM</td>
            <td>Vue.js, Svelte, Angular</td>
        </tr>
        <tr>
            <td><strong>TypeScript</strong></td>
            <td><code>^5</code></td>
            <td>Programming Language</td>
            <td>Static type safety, schema contracts, compile-time error catching</td>
            <td>Plain JavaScript</td>
        </tr>
        <tr>
            <td><strong>Convex DB</strong></td>
            <td><code>^1.25.4</code></td>
            <td>Reactive BaaS Database</td>
            <td>WebSocket real-time document sync, session persistence, queries</td>
            <td>Firebase Firestore, Supabase</td>
        </tr>
        <tr>
            <td><strong>Clerk</strong></td>
            <td><code>^6.39.7</code></td>
            <td>Auth &amp; User Management</td>
            <td>JWT session tokens, Google/Email OAuth, route-guard middleware</td>
            <td>NextAuth.js, Firebase Auth</td>
        </tr>
        <tr>
            <td><strong>Google Gemini</strong></td>
            <td><code>1.5-flash</code></td>
            <td>Generative AI LLM</td>
            <td>Real-time adaptive technical follow-up questions via REST API</td>
            <td>OpenAI GPT-4o-mini</td>
        </tr>
        <tr>
            <td><strong>ImageKit</strong></td>
            <td><code>^6.0.0</code></td>
            <td>Cloud Media Storage</td>
            <td>Uploading and hosting candidate PDF resumes and media fallback</td>
            <td>AWS S3, Cloudinary</td>
        </tr>
        <tr>
            <td><strong>Supabase Storage</strong></td>
            <td><code>^2.53.0</code></td>
            <td>Object Storage</td>
            <td>Hosting long interview video recordings in cloud buckets</td>
            <td>AWS S3, Google Cloud Storage</td>
        </tr>
        <tr>
            <td><strong>Arcjet</strong></td>
            <td><code>^1.0.0-beta.10</code></td>
            <td>Application Security</td>
            <td>Token-bucket rate limiting and bot protection on API endpoints</td>
            <td>Upstash Redis Rate Limit</td>
        </tr>
        <tr>
            <td><strong>Tailwind CSS</strong></td>
            <td><code>^4</code></td>
            <td>CSS Framework</td>
            <td>Utility-first responsive layouts, modern gradients, dark mode</td>
            <td>Bootstrap, Styled Components</td>
        </tr>
        <tr>
            <td><strong>Radix UI / Shadcn</strong></td>
            <td><code>1.1 - 1.2</code></td>
            <td>UI Primitives</td>
            <td>Accessible unstyled modal dialogs, tabs, and button components</td>
            <td>Material UI, Chakra UI</td>
        </tr>
        <tr>
            <td><strong>Web Speech API</strong></td>
            <td>Native Browser</td>
            <td>Speech Synthesis &amp; STT</td>
            <td>Zero-cost real-time speech-to-text and interviewer persona voice</td>
            <td>OpenAI Whisper, ElevenLabs</td>
        </tr>
        <tr>
            <td><strong>Canvas 2D API</strong></td>
            <td>Native Browser</td>
            <td>Computer Vision Proxy</td>
            <td>Real-time webcam pixel frame sampling for posture &amp; eye contact</td>
            <td>MediaPipe, OpenCV.js</td>
        </tr>
        <tr>
            <td><strong>IndexedDB</strong></td>
            <td>Native Browser</td>
            <td>Client-Side Database</td>
            <td>Local persistent video chunk buffer to prevent offline data loss</td>
            <td>LocalStorage, SessionStorage</td>
        </tr>
    </tbody>
</table>

<h2>2.1 Five-Point Deep-Dive for Every Technology</h2>

<h3>1. Next.js 15 (App Router)</h3>
<ul>
    <li><strong>What it is:</strong> A production React framework by Vercel offering server-side rendering (SSR), static site generation (SSG), and integrated serverless API routes.</li>
    <li><strong>Why this project uses it:</strong> It combines both the frontend React client and the backend serverless endpoints in one unified TypeScript repository, completely eliminating cross-origin CORS errors.</li>
    <li><strong>Which files use it:</strong> <code>app/layout.tsx</code>, <code>app/page.tsx</code>, <code>app/(routes)/*</code>, and all API routes under <code>app/api/*</code>.</li>
    <li><strong>Real-world analogy:</strong> A modern smartphone operating system that runs user apps on screen while seamlessly handling background network sync in the background.</li>
</ul>

<h3>2. Convex Serverless Database</h3>
<ul>
    <li><strong>What it is:</strong> A modern reactive document database designed specifically for TypeScript applications that streams real-time updates over WebSockets.</li>
    <li><strong>Why this project uses it:</strong> In traditional databases, if an interview status updates, the frontend must continuously poll the server via HTTP. In Convex, the frontend hook <code>useQuery(api.Interview.GetInterviewQuestions)</code> re-renders automatically the instant any record changes.</li>
    <li><strong>Which files use it:</strong> <code>convex/schema.ts</code>, <code>convex/Interview.ts</code>, <code>convex/users.ts</code>.</li>
    <li><strong>Real-world analogy:</strong> A shared Google Doc where edits made by one person appear immediately on everyone's screen without clicking "Refresh".</li>
</ul>

<h3>3. Clerk Authentication</h3>
<ul>
    <li><strong>What it is:</strong> A managed user identity and access management (IAM) service.</li>
    <li><strong>Why this project uses it:</strong> It provides pre-built, secure login/signup dialogs, handles password hashing, OAuth callbacks, and verifies session tokens through Next.js middleware.</li>
    <li><strong>Which files use it:</strong> <code>middleware.ts</code>, <code>app/Provider.tsx</code>, <code>app/(auth)/*</code>.</li>
    <li><strong>Real-world analogy:</strong> A high-security building keycard badge that automatically opens authorized doors and keeps unauthorized guests outside.</li>
</ul>

<h3>4. Google Gemini 1.5 Flash</h3>
<ul>
    <li><strong>What it is:</strong> Google's high-speed multimodal generative AI model optimized for low-latency reasoning and conversational probing.</li>
    <li><strong>Why this project uses it:</strong> During an interview, the candidate is waiting for the next question. Gemini 1.5 Flash returns responses in under 800 milliseconds via HTTP POST, allowing natural back-and-forth conversational rhythm.</li>
    <li><strong>Which files use it:</strong> <code>lib/roleInterviewerEngine.ts</code>, <code>app/api/generate-followup-question/route.tsx</code>.</li>
    <li><strong>Real-world analogy:</strong> A sharp, attentive hiring manager who catches a specific keyword in your answer (like <em>"Docker"</em>) and immediately asks, <em>"How did you optimize your Docker container size?"</em></li>
</ul>

<h3>5. Web Speech API (Synthesis &amp; Recognition)</h3>
<ul>
    <li><strong>What it is:</strong> The native JavaScript browser API for voice synthesis (TTS) and speech-to-text recognition (STT).</li>
    <li><strong>Why this project uses it:</strong> It requires zero paid third-party API keys, runs directly on candidate device hardware, and delivers instant verbal transcription.</li>
    <li><strong>Which files use it:</strong> <code>app/(routes)/interview/[interviewId]/start/page.tsx</code>, <code>utils/interviewerConfig.ts</code>.</li>
    <li><strong>Real-world analogy:</strong> The human ears and vocal cords built directly into the candidate's browser window.</li>
</ul>

<h3>6. HTML5 Canvas 2D Vision Telemetry</h3>
<ul>
    <li><strong>What it is:</strong> A low-level browser graphics API that allows reading and manipulating pixel arrays from video elements.</li>
    <li><strong>Why this project uses it:</strong> By downsampling the webcam stream to 320x240 pixels and calculating skin-tone coordinate centroids, the app measures candidate posture stability and head centering every 1000ms with negligible CPU consumption.</li>
    <li><strong>Which files use it:</strong> <code>utils/facialAnalysis.ts</code>.</li>
    <li><strong>Real-world analogy:</strong> A virtual interview coach sitting beside you, gently tapping your shoulder if you slouch or look away from the camera.</li>
</ul>

<!-- ========================================== -->
<!-- CHAPTER 3: BUILDING THE PROJECT FROM SCRATCH -->
<!-- ========================================== -->
<h1 id="ch3">CHAPTER 3: BUILDING THE PROJECT FROM SCRATCH</h1>

<p>
    If an interviewer asks you: <em>"Walk me through how you built this application from a completely empty directory"</em>, this chapter gives you the exact chronological engineering sequence.
</p>

<h2>3.1 Step 1: Development Environment Setup</h2>
<p>
    Before writing any code, install the required runtimes:
</p>
<pre><code># 1. Verify Node.js (v18.0.0 or higher required; project uses v24)
node -v

# 2. Verify npm (Node Package Manager)
npm -v

# 3. Verify Git version control
git --version</code></pre>

<h2>3.2 Step 2: Initialize Next.js 15 Application</h2>
<pre><code># Create the initial project with TypeScript, Tailwind CSS, and App Router
npx create-next-app@latest ai-mock-interview --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Navigate into the project folder
cd ai-mock-interview</code></pre>

<h2>3.3 Step 3: Install Core Dependencies</h2>
<p>Install the exact dependencies specified in <code>package.json</code>:</p>
<pre><code># Install Authentication, Database, and UI Primitives
npm install @clerk/nextjs convex @supabase/supabase-js imagekit axios @arcjet/next @arcjet/inspect

# Install Icons and UI Animation
npm install lucide-react @tabler/icons-react motion next-themes sonner

# Install Radix UI components for accessible modals and tabs
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-slot class-variance-authority clsx tailwind-merge</code></pre>

<h2>3.4 Step 4: Configure Database &amp; Environment</h2>
<pre><code># Initialize Convex reactive database
npx convex dev

# This automatically logs you into Convex, provisions a cloud database,
# and generates the convex/_generated/ directory with TypeScript types.</code></pre>

<h2>3.5 Step 5: Chronological Development Workflow</h2>
<ol>
    <li><strong>Phase 1 — Schema &amp; Authentication:</strong> Set up <code>convex/schema.ts</code> defining <code>UserTable</code> and <code>InterviewSessionTable</code>. Wrap the application in <code>ConvexClientProvider.tsx</code> and <code>middleware.ts</code> to protect routes.</li>
    <li><strong>Phase 2 — Question Engine (Domain Logic):</strong> Create <code>lib/roleInterviewerEngine.ts</code> containing the 13 role normalizers and 8-phase question progressions.</li>
    <li><strong>Phase 3 — Interview Configuration Dialog:</strong> Build <code>CreateInterviewDialog.tsx</code> with role inputs, experience selection, PDF resume upload via ImageKit, and session saving into Convex.</li>
    <li><strong>Phase 4 — Live Interview Room Engine:</strong> Implement <code>start/page.tsx</code> connecting camera preview, speech synthesis, microphone transcription, question timer, and Canvas 2D posture tracking.</li>
    <li><strong>Phase 5 — Adaptive AI &amp; Feedback Evaluation:</strong> Build the serverless endpoints <code>api/generate-followup-question</code> (Gemini 1.5 Flash) and <code>api/interview-feedback</code> (scoring &amp; STAR answers).</li>
    <li><strong>Phase 6 — Synchronized Playback &amp; Recruiter Reports:</strong> Construct the video playback timeline with question jumping and executive recruiter scorecards.</li>
</ol>

<!-- ========================================== -->
<!-- CHAPTER 4: COMPLETE FOLDER STRUCTURE -->
<!-- ========================================== -->
<h1 id="ch4">CHAPTER 4: COMPLETE FOLDER &amp; FILE STRUCTURE</h1>

<h2>4.1 Complete Visual Architecture Tree</h2>
<pre><code>c:/Users/Deekshitha P/Documents/AI-Mock-Interview-2.0-main/
├── app/                                # Next.js 15 App Router Root
│   ├── (auth)/                         # Authentication Route Group (isolated layout)
│   │   ├── sign-in/[[...sign-in]]/     # Clerk Hosted Sign-In Component
│   │   └── sign-up/[[...sign-up]]/     # Clerk Hosted Sign-Up Component
│   ├── (routes)/                       # Protected Application Routes Group
│   │   ├── dashboard/                  # Candidate Analytics &amp; Past Sessions
│   │   │   ├── _components/            # Dashboard Widgets (InterviewCard, Analytics)
│   │   │   └── page.tsx                # Dashboard Main View
│   │   ├── interview/[interviewId]/    # Dynamic Route for Interview Sessions
│   │   │   ├── page.tsx                # Lobby: Device Checks &amp; Voice Persona Selection
│   │   │   ├── start/                  # Live Interview Room (Camera, Speech, Timer)
│   │   │   │   ├── _components/        # AudioVisualizer, QuestionTimer, VoiceSettings
│   │   │   │   └── page.tsx            # Live Speech &amp; Vision Engine
│   │   │   ├── feedback/               # Candidate Scorecard &amp; STAR Model Answers
│   │   │   ├── playback/               # Recorded Video Replay + Question Timeline
│   │   │   └── recruiter-report/       # Executive Evaluation for Hiring Managers
│   │   ├── questions/                  # Technical Practice Question Flashcards
│   │   ├── upgrade/                    # Pricing / Plan Selection Screen
│   │   └── _components/                # Shared Header &amp; CreateInterviewDialog.tsx
│   ├── api/                            # Backend Serverless REST Endpoints
│   │   ├── generate-interview-questions/ # Creates 8-phase questions + uploads resume
│   │   ├── generate-followup-question/  # Real-time Gemini 1.5 Flash adaptive follow-up
│   │   ├── interview-feedback/         # Calculates scores, fillers, STAR rewrites
│   │   ├── upload-recording/           # Multi-tier cloud video upload handler
│   │   ├── delete-recording/           # Permanent video deletion handler
│   │   └── arcjet/                     # Rate limiting security test endpoint
│   ├── layout.tsx                      # Root Layout with Font &amp; Theme Providers
│   ├── page.tsx                        # Public Landing Page (Hero section)
│   ├── Provider.tsx                    # Syncs Clerk authenticated user to Convex UserTable
│   └── ConvexClientProvider.tsx        # Injects Convex React Client with Clerk JWT Tokens
│
├── convex/                             # Convex Reactive BaaS Backend
│   ├── schema.ts                       # Database Table Schemas &amp; Field Constraints
│   ├── users.ts                        # User Queries &amp; Mutations
│   └── Interview.ts                    # Interview Session Queries, Mutations &amp; Storage URLs
│
├── lib/                                # Core Domain Business Logic
│   ├── roleInterviewerEngine.ts        # 13 Role Domains, 8 Phases, Gemini API Caller
│   └── utils.ts                        # Tailwind CSS Class Merger (cn helper)
│
├── utils/                              # Subsystem Telemetry &amp; Storage Utilities
│   ├── arcjet.ts                       # Arcjet Token Bucket Configuration
│   ├── facialAnalysis.ts               # HTML5 Canvas 2D Skin Centroid Telemetry
│   ├── interviewerConfig.ts            # Male/Female Persona Voice Keyword Mappings
│   └── recordingStorage.ts             # IndexedDB Local Buffer &amp; Cloud Upload Manager
│
├── components/                         # UI Design System Primitives (Shadcn / Radix)
│   └── ui/                             # Button, Dialog, Tabs, Input, Textarea
│
├── middleware.ts                       # Clerk Route Interceptor &amp; Security Shield
├── package.json                        # Dependencies, Scripts, Node Environment
├── tailwind.config.ts                  # Tailwind CSS Configuration
└── tsconfig.json                       # TypeScript Strict Mode &amp; Path Aliases
</code></pre>

<h2>4.2 Master File Catalog &amp; Component Interconnections</h2>
<table>
    <thead>
        <tr>
            <th>File Path</th>
            <th>Layer</th>
            <th>Primary Responsibility</th>
            <th>Connected Dependencies</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>middleware.ts</code></td>
            <td>Security / Edge</td>
            <td>Protects private routes (<code>/dashboard</code>, <code>/interview</code>) from unauthenticated users.</td>
            <td>Clerk NextJS Server Engine</td>
        </tr>
        <tr>
            <td><code>app/Provider.tsx</code></td>
            <td>State / Auth</td>
            <td>Synchronizes Clerk user credentials into Convex <code>UserTable</code> on first load.</td>
            <td><code>useUser</code>, <code>convex/users.ts</code></td>
        </tr>
        <tr>
            <td><code>CreateInterviewDialog.tsx</code></td>
            <td>Frontend Form</td>
            <td>Captures role, tech stack, resume; requests questions; inserts Convex session.</td>
            <td><code>/api/generate-interview-questions</code>, <code>convex/Interview.ts</code></td>
        </tr>
        <tr>
            <td><code>lib/roleInterviewerEngine.ts</code></td>
            <td>Domain Logic</td>
            <td>Generates role-specific questions across 13 domains; invokes Gemini API for follow-ups.</td>
            <td>Google Gemini 1.5 Flash REST API</td>
        </tr>
        <tr>
            <td><code>start/page.tsx</code></td>
            <td>Frontend Engine</td>
            <td>Conducts live verbal interview, manages timer, captures STT answers, triggers follow-ups.</td>
            <td>Web Speech API, <code>facialAnalysis.ts</code>, <code>recordingStorage.ts</code></td>
        </tr>
        <tr>
            <td><code>utils/facialAnalysis.ts</code></td>
            <td>Vision Telemetry</td>
            <td>Performs 320x240 Canvas 2D frame sampling for skin centroid and eye contact.</td>
            <td>HTMLVideoElement, HTMLCanvasElement</td>
        </tr>
        <tr>
            <td><code>utils/recordingStorage.ts</code></td>
            <td>Storage Manager</td>
            <td>Buffers video blobs in client-side IndexedDB and uploads to cloud storage.</td>
            <td>IndexedDB API, <code>/api/upload-recording</code></td>
        </tr>
        <tr>
            <td><code>feedback/page.tsx</code></td>
            <td>Report View</td>
            <td>Displays performance scores, STAR improvements, filler metrics, and playback links.</td>
            <td><code>convex/Interview.ts</code>, <code>/api/interview-feedback</code></td>
        </tr>
    </tbody>
</table>

<!-- ========================================== -->
<!-- CHAPTER 5: FRONTEND ARCHITECTURE FROM BASICS -->
<!-- ========================================== -->
<h1 id="ch5">CHAPTER 5: FRONTEND ARCHITECTURE FROM BASICS</h1>

<h2>5.1 Core Web Concepts Explained Simply</h2>
<ul>
    <li><strong>HTML (HyperText Markup Language):</strong> The structural skeleton of every webpage (buttons, inputs, headings).</li>
    <li><strong>CSS (Cascading Style Sheets):</strong> The visual styling (colors, padding, flexbox grids, animations). In this project, written using <strong>Tailwind CSS utility classes</strong> like <code>flex items-center gap-3 p-4 bg-white rounded-xl</code>.</li>
    <li><strong>JavaScript &amp; TypeScript:</strong> The programming logic that makes pages interactive. TypeScript adds compile-time types (e.g., ensuring a function expects a <code>number</code>, not a <code>string</code>), preventing runtime crashes.</li>
    <li><strong>React:</strong> A component-based UI library where pages are broken down into reusable building blocks (components). When data changes, React efficiently updates only the changed DOM elements via its Virtual DOM.</li>
    <li><strong>Next.js App Router:</strong> Organizes pages using folder-based routing. For example, a folder named <code>app/(routes)/dashboard/page.tsx</code> automatically maps to the URL <code>https://yourdomain.com/dashboard</code>.</li>
</ul>

<h2>5.2 React Hooks Actually Used in the Project</h2>
<table>
    <thead>
        <tr>
            <th>React Hook</th>
            <th>Where Used in Code</th>
            <th>Exact Purpose in MAPD</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>useState</code></td>
            <td><code>CreateInterviewDialog.tsx</code>, <code>start/page.tsx</code></td>
            <td>Stores local component variables that trigger UI re-renders when modified (e.g., <code>loading</code>, <code>currentQuestionIndex</code>).</td>
        </tr>
        <tr>
            <td><code>useEffect</code></td>
            <td><code>start/page.tsx</code>, <code>AppHeader.tsx</code></td>
            <td>Executes side-effects after rendering, such as starting the question timer or initializing the camera media stream.</td>
        </tr>
        <tr>
            <td><code>useRef</code></td>
            <td><code>start/page.tsx</code>, <code>AudioVisualizer.tsx</code></td>
            <td>Holds mutable references to DOM elements (like <code>&lt;video ref={videoRef}&gt;</code>) or active timers without triggering re-renders.</td>
        </tr>
        <tr>
            <td><code>useContext</code></td>
            <td><code>CreateInterviewDialog.tsx</code></td>
            <td>Subscribes to global application state via <code>UserDetailContext</code> to access the current user's Convex ID.</td>
        </tr>
        <tr>
            <td><code>useRouter</code></td>
            <td><code>CreateInterviewDialog.tsx</code>, <code>feedback/page.tsx</code></td>
            <td>Next.js hook for programmatically navigating between pages without a full browser reload (e.g., <code>router.push()</code>).</td>
        </tr>
        <tr>
            <td><code>useQuery</code></td>
            <td><code>dashboard/page.tsx</code>, <code>playback/page.tsx</code></td>
            <td>Convex reactive hook that subscribes to live database records over WebSockets.</td>
        </tr>
        <tr>
            <td><code>useMutation</code></td>
            <td><code>CreateInterviewDialog.tsx</code>, <code>start/page.tsx</code></td>
            <td>Convex hook that returns an asynchronous function to insert or update database records.</td>
        </tr>
    </tbody>
</table>

<h2>5.3 Walkthrough of Every Major User Screen</h2>
<ol>
    <li><strong>1. Landing Page (<code>app/page.tsx</code>):</strong> Displays the hero section (<code>Hero.tsx</code>), animated badges, features breakdown, and a call-to-action button that routes the user to login or dashboard.</li>
    <li><strong>2. Authentication Screens (<code>app/(auth)/*</code>):</strong> Renders Clerk's secure OAuth components for Google and email logins.</li>
    <li><strong>3. Dashboard (<code>app/(routes)/dashboard/page.tsx</code>):</strong> Displays user statistics, overall average interview score, streak cards, and a grid of previous interview sessions fetched via <code>api.Interview.GetUserInterviews</code>.</li>
    <li><strong>4. Interview Lobby (<code>app/(routes)/interview/[interviewId]/page.tsx</code>):</strong> Allows the candidate to test their webcam and microphone, select their preferred interviewer persona (Male / Female voice), and read role-specific instructions before starting.</li>
    <li><strong>5. Live Interview Room (<code>app/(routes)/interview/[interviewId]/start/page.tsx</code>):</strong> The core interactive room displaying the active question, speech synthesis playback, real-time STT candidate transcript, audio frequency visualizer, and Canvas 2D posture status.</li>
    <li><strong>6. Feedback Report (<code>app/(routes)/interview/[interviewId]/feedback/page.tsx</code>):</strong> Renders an executive performance report with overall score, verbal filler counts, question-by-question technical breakdown, and model STAR answers.</li>
    <li><strong>7. Synchronized Playback (<code>app/(routes)/interview/[interviewId]/playback/page.tsx</code>):</strong> Plays the recorded interview video alongside a timeline of questions, allowing users to jump directly to where each question was answered.</li>
</ol>
"""

print("Content Part 1 (Chapters 1 to 5) Loaded.")
