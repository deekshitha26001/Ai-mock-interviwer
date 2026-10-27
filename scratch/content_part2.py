# -*- coding: utf-8 -*-
"""
Content Part 2: Chapters 6 to 10
"""

CHAPTER_6_10 = """
<!-- ========================================== -->
<!-- CHAPTER 6: BACKEND & SERVERLESS BUSINESS LOGIC -->
<!-- ========================================== -->
<h1 id="ch6">CHAPTER 6: BACKEND &amp; SERVERLESS BUSINESS LOGIC</h1>

<h2>6.1 What is the Backend in this Project?</h2>
<p>
    A common misconception for beginners is assuming every web application must have a separate Python Django or Node Express backend server running on a separate port (like <code>localhost:5000</code>).
</p>
<p>
    <strong>In this project, the backend is a modern Serverless Monolith:</strong>
</p>
<ul>
    <li><strong>Next.js 15 Serverless API Routes (<code>app/api/*</code>):</strong> Next.js runs on a Node.js serverless execution environment. Every subfolder containing a <code>route.ts</code> or <code>route.tsx</code> file acts as an independent, scalable REST endpoint that executes on demand and scales down to zero when idle.</li>
    <li><strong>Convex Serverless Functions (<code>convex/*</code>):</strong> Convex runs cloud TypeScript functions on its reactive backend. It provides <em>mutations</em> (functions that write data) and <em>queries</em> (functions that read data) with end-to-end type safety.</li>
</ul>

<h2>6.2 API Route Handlers Explained</h2>
<p>
    In Next.js App Router, an API route is defined by exporting asynchronous functions named after HTTP methods (e.g., <code>POST</code>, <code>GET</code>, <code>DELETE</code>):
</p>
<pre><code>import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // Parses incoming JSON
        // Execute business logic...
        return NextResponse.json({ status: 200, message: "Success" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}</code></pre>

<h2>6.3 Convex Queries vs. Mutations</h2>
<table>
    <thead>
        <tr>
            <th>Concept</th>
            <th>Defined With</th>
            <th>Database Action</th>
            <th>Client Hook</th>
            <th>Example in Project</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Query</strong></td>
            <td><code>query({ handler: async (ctx, args) =&gt; ... })</code></td>
            <td>Read-Only (pure function, cached, reactive)</td>
            <td><code>useQuery(...)</code></td>
            <td><code>api.Interview.GetInterviewQuestions</code></td>
        </tr>
        <tr>
            <td><strong>Mutation</strong></td>
            <td><code>mutation({ handler: async (ctx, args) =&gt; ... })</code></td>
            <td>Write / Update / Delete (atomic transaction)</td>
            <td><code>useMutation(...)</code></td>
            <td><code>api.Interview.SaveInterviewQuestion</code></td>
        </tr>
    </tbody>
</table>

<h2>6.4 Input Validation &amp; Error Handling</h2>
<p>
    The backend rigorously validates inputs before executing sensitive operations:
</p>
<ul>
    <li><strong>Authentication Checks:</strong> In routes like <code>/api/upload-recording</code>, the code calls <code>await currentUser()</code> from Clerk. If no user session is present, it immediately rejects the request with HTTP 401 Unauthorized.</li>
    <li><strong>File Type &amp; Size Checks:</strong> In <code>CreateInterviewDialog.tsx</code> and <code>/api/generate-interview-questions</code>, the system verifies that uploaded resumes have the MIME-type <code>application/pdf</code> and a size under 10 megabytes.</li>
    <li><strong>Error Status Codes:</strong> Uses standardized HTTP codes: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 429 (Rate Limit Exceeded), and 500 (Internal Server Error).</li>
</ul>

<!-- ========================================== -->
<!-- CHAPTER 7: DATABASE EXPLANATION (CONVEX SCHEMA) -->
<!-- ========================================== -->
<h1 id="ch7">CHAPTER 7: DATABASE DEEP DIVE (CONVEX SCHEMA)</h1>

<h2>7.1 Which Database Technology is Used and Why?</h2>
<p>
    The project uses <strong>Convex</strong>, an event-driven serverless document database. It is selected over traditional relational SQL databases (like MySQL/PostgreSQL) and traditional NoSQL databases (like MongoDB) because:
</p>
<ol>
    <li><strong>Zero-Config Real-Time Sync:</strong> The database communicates with the frontend via persistent WebSockets. When feedback is saved, the dashboard re-renders instantly without needing custom WebSocket servers or manual polling.</li>
    <li><strong>End-to-End TypeScript Validation:</strong> The database schema is defined directly in TypeScript (<code>convex/schema.ts</code>). Convex automatically generates client-side types, catching schema bugs at compile time.</li>
    <li><strong>Integrated Cloud Object Storage:</strong> Convex provides built-in file storage (<code>ctx.storage.generateUploadUrl</code>), eliminating the absolute necessity of external S3 buckets for simple file persistence.</li>
</ol>

<h2>7.2 Detailed Database Schema Analysis</h2>
<p>
    Here is the exact schema defined in [`convex/schema.ts`](file:///c:/Users/Deekshitha%20P/Documents/AI-Mock-Interview-2.0-main/convex/schema.ts):
</p>

<pre><code>import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Table 1: User Profiles
    UserTable: defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
    }),

    // Table 2: Interview Sessions
    InterviewSessionTable: defineTable({
        interviewQuestions: v.any(),                       // Array of 8-phase questions
        resumeUrl: v.union(v.string(), v.null()),          // Public URL of PDF resume
        userId: v.id('UserTable'),                         // Foreign Key pointing to UserTable._id
        status: v.string(),                                // 'draft' | 'completed'
        jobTitle: v.union(v.string(), v.null()),           // Target Job Role
        jobDescription: v.union(v.string(), v.null()),     // Job description requirements
        experienceLevel: v.optional(v.union(v.string(), v.null())), // e.g., '1–2 years'
        techStack: v.optional(v.union(v.string(), v.null())),       // e.g., 'React, Next.js'
        feedback: v.optional(v.any()),                     // Complete evaluation JSON
        recordingUrl: v.optional(v.union(v.string(), v.null())),    // Cloud video URL
        recordingId: v.optional(v.union(v.string(), v.null())),     // Storage file identifier
        recordingStorageId: v.optional(v.union(v.string(), v.null())),
        fileSize: v.optional(v.union(v.number(), v.null())),        // Size in bytes
        durationSeconds: v.optional(v.union(v.number(), v.null())), // Video length
        storageProvider: v.optional(v.union(v.string(), v.null())), // 'supabase' | 'convex' | 'imagekit' | 'server'
        questionTimestamps: v.optional(v.any()),           // Array mapping question index to video seconds
        candidateAnswers: v.optional(v.any()),             // Transcribed speech answers
        weakTopics: v.optional(v.any()),                   // Identified weakness categories
        interviewerGender: v.optional(v.union(v.string(), v.null())) // 'male' | 'female'
    })
});</code></pre>

<h2>7.3 Table Relationships (1-to-Many Architecture)</h2>
<p>
    The relationship between users and interview sessions is a classic <strong>One-to-Many (1:N) relationship</strong>:
</p>
<pre><code>[ UserTable ] (One User)
      │
      │ 1
      │
      ▼ N
[ InterviewSessionTable ] (Many Interview Sessions)
  Foreign Key: userId ──► References UserTable._id</code></pre>
<ul>
    <li>A candidate creates an account once, generating one record in <code>UserTable</code> with a unique Convex ID (e.g., <code>"jh72f8..."</code>).</li>
    <li>Each time that candidate takes a mock interview, a new record is added to <code>InterviewSessionTable</code> with <code>userId: args.uid</code>.</li>
    <li>When rendering the dashboard, the query <code>GetUserInterviews</code> filters all sessions by <code>q.eq(q.field('userId'), args.userId)</code> to display only that specific candidate's interview history.</li>
</ul>

<h2>7.4 Inspecting Database Records Safely</h2>
<p>
    To view and inspect live records during development, run:
</p>
<pre><code>npx convex dashboard</code></pre>
<p>
    This opens Convex's browser-based administrative console where you can inspect table rows, monitor WebSocket connections, view function logs, and delete test records.
</p>

<!-- ========================================== -->
<!-- CHAPTER 8: COMPLETE REST API DOCUMENTATION -->
<!-- ========================================== -->
<h1 id="ch8">CHAPTER 8: COMPLETE REST API DOCUMENTATION</h1>

<h2>8.1 Fundamental Networking Concepts</h2>
<ul>
    <li><strong>API (Application Programming Interface):</strong> A standardized contract that allows two software components (e.g., frontend React client and backend server) to communicate.</li>
    <li><strong>REST (Representational State Transfer):</strong> An architectural style that uses standard HTTP methods (GET, POST, DELETE) and endpoints (URIs) to transfer representations of resources.</li>
    <li><strong>JSON vs. FormData:</strong>
        <ul>
            <li><strong>JSON (JavaScript Object Notation):</strong> Lightweight text format for transferring structured data (e.g., <code>{ "jobTitle": "DevOps" }</code>).</li>
            <li><strong>FormData:</strong> Multipart MIME format (<code>multipart/form-data</code>) required when transmitting raw binary files (such as PDF resumes or video recordings) alongside text fields.</li>
        </ul>
    </li>
</ul>

<h2>8.2 API Endpoints Master Catalog</h2>

<h3>1. POST <code>/api/generate-interview-questions</code></h3>
<ul>
    <li><strong>File:</strong> <code>app/api/generate-interview-questions/route.tsx</code></li>
    <li><strong>Purpose:</strong> Validates user input, uploads resume PDF to ImageKit, and generates 8-phase structured questions.</li>
    <li><strong>Request Format:</strong> <code>multipart/form-data</code></li>
    <li><strong>Payload:</strong> <code>file</code> (binary PDF), <code>jobTitle</code> (string), <code>jobDescription</code> (string), <code>techStack</code> (string), <code>experienceLevel</code> (string).</li>
    <li><strong>Response (200 OK):</strong>
        <pre><code>{
  "questions": [
    { "id": 1, "phase": "Introduction", "question": "Walk me through your background...", "answer": "..." },
    { "id": 2, "phase": "Technical Fundamentals", "question": "Explain React Virtual DOM...", "answer": "..." }
  ],
  "resumeUrl": "https://ik.imagekit.io/mapd/upload-1729600000.pdf",
  "status": 200
}</code></pre>
    </li>
</ul>

<h3>2. POST <code>/api/generate-followup-question</code></h3>
<ul>
    <li><strong>File:</strong> <code>app/api/generate-followup-question/route.tsx</code></li>
    <li><strong>Purpose:</strong> Calls Google Gemini 1.5 Flash to generate an adaptive technical probe based on the candidate's spoken response.</li>
    <li><strong>Request Format:</strong> <code>application/json</code></li>
    <li><strong>Payload:</strong>
        <pre><code>{
  "currentQuestion": "Explain Docker containers.",
  "candidateAnswer": "I use Docker containers to package my Spring Boot apps with Dockerfiles.",
  "jobTitle": "Backend Developer",
  "techStack": "Java, Spring Boot, Docker",
  "currentPhase": 2
}</code></pre>
    </li>
    <li><strong>Response (200 OK):</strong>
        <pre><code>{
  "hasFollowUp": true,
  "followUpQuestion": "That's great. How do you implement multi-stage Docker builds to reduce your final image size?",
  "detectedKeywords": ["docker", "dockerfiles", "spring boot"],
  "reason": "gemini_adaptive"
}</code></pre>
    </li>
</ul>

<h3>3. POST <code>/api/interview-feedback</code></h3>
<ul>
    <li><strong>File:</strong> <code>app/api/interview-feedback/route.tsx</code></li>
    <li><strong>Purpose:</strong> Performs deterministic scoring on candidate's transcript, detects verbal fillers, and generates STAR method answers.</li>
    <li><strong>Request Format:</strong> <code>application/json</code></li>
    <li><strong>Response (200 OK):</strong>
        <pre><code>{
  "overallScore": 82,
  "techScore": 85,
  "relevanceScore": 80,
  "fillerWordMetrics": { "totalFillers": 4, "topFillers": { "um": 3, "like": 1 } },
  "answerEvaluations": [ ... ],
  "status": 200
}</code></pre>
    </li>
</ul>

<h3>4. POST <code>/api/upload-recording</code></h3>
<ul>
    <li><strong>File:</strong> <code>app/api/upload-recording/route.ts</code></li>
    <li><strong>Purpose:</strong> Uploads recorded video blob to Supabase Storage with fallback to ImageKit, Convex, or local server disk.</li>
    <li><strong>Request Format:</strong> <code>multipart/form-data</code></li>
    <li><strong>Payload:</strong> <code>file</code> (video/webm blob), <code>interviewId</code> (string), <code>durationSeconds</code> (number).</li>
</ul>

<h2>8.3 System API Execution Flowchart</h2>
<pre><code>[ Candidate in Browser ]
   │
   ├── (1) Create Interview ──► POST /api/generate-interview-questions ──► ImageKit + Role Engine
   │
   ├── (2) Candidate Speaks ──► POST /api/generate-followup-question  ──► Google Gemini 1.5 Flash
   │
   ├── (3) Session Complete ──► POST /api/upload-recording             ──► Supabase / Convex Storage
   │
   └── (4) Grade Answers   ──► POST /api/interview-feedback          ──► Transcript Scoring Engine
                                  │
                                  ▼
                     [ Convex Database: UpdateFeedback ]</code></pre>

<!-- ========================================== -->
<!-- CHAPTER 9: API KEYS & ENVIRONMENT VARIABLES -->
<!-- ========================================== -->
<h1 id="ch9">CHAPTER 9: API KEYS &amp; ENVIRONMENT VARIABLES</h1>

<h2>9.1 Understanding Environment Variables</h2>
<ul>
    <li><strong><code>.env.example</code>:</strong> A template file committed to Git that lists required variable names with empty values, guiding developers on what keys are needed.</li>
    <li><strong><code>.env.local</code>:</strong> A private, local file containing actual secret values. <strong>Never committed to Git</strong> (ignored by <code>.gitignore</code>) to prevent accidental credential leakage.</li>
    <li><strong>The <code>NEXT_PUBLIC_</code> Prefix Rule:</strong>
        <ul>
            <li>Variables prefixed with <code>NEXT_PUBLIC_</code> (like <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>) are embedded into the client-side JavaScript bundle sent to the browser.</li>
            <li>Variables <strong>without</strong> the prefix (like <code>GEMINI_API_KEY</code> or <code>CLERK_SECRET_KEY</code>) are strictly accessible only on the server, ensuring attackers cannot extract your secret keys from browser inspection.</li>
        </ul>
    </li>
</ul>

<h2>9.2 Master Environment Variables Reference Table</h2>
<table>
    <thead>
        <tr>
            <th>Variable Name</th>
            <th>Service</th>
            <th>Required?</th>
            <th>Scope</th>
            <th>Purpose</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code></td>
            <td>Clerk</td>
            <td><strong>Required</strong></td>
            <td>Client &amp; Server</td>
            <td>Identifies your Clerk application to initialize sign-in components.</td>
        </tr>
        <tr>
            <td><code>CLERK_SECRET_KEY</code></td>
            <td>Clerk</td>
            <td><strong>Required</strong></td>
            <td>Server Only</td>
            <td>Secret key for verifying user session tokens in middleware and API routes.</td>
        </tr>
        <tr>
            <td><code>NEXT_PUBLIC_CONVEX_URL</code></td>
            <td>Convex</td>
            <td><strong>Required</strong></td>
            <td>Client &amp; Server</td>
            <td>The HTTPS/WebSocket URL endpoint of your Convex cloud backend.</td>
        </tr>
        <tr>
            <td><code>GEMINI_API_KEY</code></td>
            <td>Google AI</td>
            <td><strong>Required</strong></td>
            <td>Server Only</td>
            <td>Authorizes requests to Google Gemini 1.5 Flash for follow-up questions.</td>
        </tr>
        <tr>
            <td><code>IMAGEKIT_URL_PUBLIC_KEY</code></td>
            <td>ImageKit</td>
            <td>Optional</td>
            <td>Server Only</td>
            <td>Public identifier for ImageKit media upload requests.</td>
        </tr>
        <tr>
            <td><code>IMAGEKIT_URL_PRIVATE_KEY</code></td>
            <td>ImageKit</td>
            <td>Optional</td>
            <td>Server Only</td>
            <td>Secret key for signing resume PDF and recording uploads to ImageKit.</td>
        </tr>
        <tr>
            <td><code>IMAGEKIT_URL_ENDPOINT</code></td>
            <td>ImageKit</td>
            <td>Optional</td>
            <td>Server Only</td>
            <td>The CDN endpoint URL where uploaded resumes are hosted.</td>
        </tr>
        <tr>
            <td><code>NEXT_PUBLIC_SUPABASE_URL</code></td>
            <td>Supabase</td>
            <td>Optional</td>
            <td>Client &amp; Server</td>
            <td>Endpoint for Supabase Object Storage bucket (<code>interview-recordings</code>).</td>
        </tr>
        <tr>
            <td><code>SUPABASE_SERVICE_ROLE_KEY</code></td>
            <td>Supabase</td>
            <td>Optional</td>
            <td>Server Only</td>
            <td>Administrative key for uploading and deleting recorded interview videos.</td>
        </tr>
        <tr>
            <td><code>ARCJET_KEY</code></td>
            <td>Arcjet</td>
            <td>Optional</td>
            <td>Server Only</td>
            <td>Authorizes token-bucket rate limiting and bot detection shield.</td>
        </tr>
    </tbody>
</table>

<div class="callout callout-warning">
    <div class="callout-title">⚠️ Security Protocol: Leaked Key Remediation</div>
    If an API key is accidentally committed to a public GitHub repository:
    <ol>
        <li>Immediately navigate to the provider dashboard (e.g., Google Cloud or Clerk) and <strong>Revoke / Delete</strong> the key.</li>
        <li>Generate a new key and update your local <code>.env.local</code> and production deployment settings.</li>
        <li>Use <code>git filter-branch</code> or BFG Repo-Cleaner to scrub the secret from your Git commit history.</li>
    </ol>
</div>

<!-- ========================================== -->
<!-- CHAPTER 10: AUTHENTICATION & SYSTEM SECURITY -->
<!-- ========================================== -->
<h1 id="ch10">CHAPTER 10: AUTHENTICATION &amp; SYSTEM SECURITY</h1>

<h2>10.1 How Authentication Works with Clerk</h2>
<p>
    Authentication in this project is managed by <strong>Clerk</strong> using secure JSON Web Tokens (JWT) stored in HTTP-only, SameSite cookies.
</p>
<ol>
    <li><strong>Sign In / Sign Up:</strong> The candidate navigates to <code>/sign-in</code> or <code>/sign-up</code>. Clerk handles OAuth 2.0 with Google or email-based passwordless magic links.</li>
    <li><strong>Session Token Issuance:</strong> Upon successful login, Clerk issues a cryptographically signed JWT cookie.</li>
    <li><strong>Route Interception (<code>middleware.ts</code>):</strong> Every incoming request is intercepted by Clerk's middleware.
        <pre><code>import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/interview(.*)',
    '/questions(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
});</code></pre>
        If an unauthenticated guest attempts to visit <code>/dashboard</code>, they are immediately redirected to <code>/sign-in</code>.
    </li>
    <li><strong>Database Synchronization (<code>app/Provider.tsx</code>):</strong> When the authenticated dashboard loads, a React <code>useEffect</code> checks if the user exists in Convex's <code>UserTable</code>. If not, it calls the mutation <code>CreateNewUser</code>, inserting their email, display name, and avatar image.</li>
</ol>

<h2>10.2 Defense-in-Depth Security Features</h2>
<ul>
    <li><strong>Arcjet Rate Limiting:</strong> Configured in <code>utils/arcjet.ts</code> using a Token Bucket algorithm. It protects the costly <code>generate-interview-questions</code> route from automated script scraping and DDoS attacks.</li>
    <li><strong>Database-Level Authorization:</strong> In <code>convex/Interview.ts</code>, query functions like <code>GetInterviewQuestions</code> accept a <code>uid</code> parameter. If a user tries to query another candidate's interview ID, the function validates ownership (<code>record.userId === args.uid</code>) and aborts if unauthorized.</li>
    <li><strong>Video File Ownership Checks:</strong> When calling <code>/api/delete-recording</code>, the server extracts the user ID from the session and verifies that the file path in Supabase begins with that specific user's ID before allowing deletion.</li>
</ul>
"""

print("Content Part 2 (Chapters 6 to 10) Loaded.")
