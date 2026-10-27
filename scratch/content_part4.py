# -*- coding: utf-8 -*-
"""
Content Part 4: Chapters 15 to 17
"""

CHAPTER_15_17 = """
<!-- ========================================== -->
<!-- CHAPTER 15: PRODUCTION DEPLOYMENT FROM SCRATCH -->
<!-- ========================================== -->
<h1 id="ch15">CHAPTER 15: PRODUCTION DEPLOYMENT FROM SCRATCH</h1>

<h2>15.1 Deployment Architecture Overview</h2>
<p>
    Deploying a full-stack Next.js application with a serverless backend and external services requires orchestrating three cloud providers:
</p>
<ol>
    <li><strong>Frontend &amp; API Routes:</strong> Hosted on <strong>Vercel</strong> (or Netlify). Vercel is built by the creators of Next.js and automatically provisions globally distributed edge functions.</li>
    <li><strong>Database &amp; Reactive Backend:</strong> Hosted on <strong>Convex Cloud</strong>. Automatically deploys cloud schema and TypeScript functions.</li>
    <li><strong>Authentication Service:</strong> Managed on <strong>Clerk Dashboard</strong>, routing production domain redirects.</li>
</ol>

<h2>15.2 Step-by-Step Production Deployment Workflow</h2>

<h3>Step 1: Validate Production Build Locally</h3>
<p>Before pushing code to Git, always run a production compilation test to ensure there are no TypeScript or syntax errors:</p>
<pre><code># Test production compilation
npm run build</code></pre>
<p>If the build completes with green checkmarks, the application is ready for production.</p>

<h3>Step 2: Commit and Push to GitHub</h3>
<pre><code>git add .
git commit -m "Deploy: Production ready release"
git push origin main</code></pre>

<h3>Step 3: Deploy Convex to Production</h3>
<p>Deploy your Convex database schema and backend functions to production:</p>
<pre><code>npx convex deploy</code></pre>
<p>Convex will output your production deployment URL (e.g., <code>https://golden-otter-123.convex.cloud</code>).</p>

<h3>Step 4: Connect Repository to Vercel</h3>
<ol>
    <li>Log into <a href="https://vercel.com">vercel.com</a> and click <strong>"Add New" ➔ "Project"</strong>.</li>
    <li>Select your GitHub repository <code>AI-Mock-Interview-2.0</code>.</li>
    <li>In <strong>Environment Variables</strong>, paste all production keys:
        <ul>
            <li><code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code></li>
            <li><code>CLERK_SECRET_KEY</code></li>
            <li><code>NEXT_PUBLIC_CONVEX_URL</code> (Your production Convex URL)</li>
            <li><code>CONVEX_DEPLOYMENT</code> (Your production Convex deployment ID)</li>
            <li><code>GEMINI_API_KEY</code></li>
            <li><code>IMAGEKIT_URL_PUBLIC_KEY</code> / <code>IMAGEKIT_URL_PRIVATE_KEY</code> / <code>IMAGEKIT_URL_ENDPOINT</code></li>
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code> / <code>SUPABASE_SERVICE_ROLE_KEY</code></li>
            <li><code>ARCJET_KEY</code></li>
        </ul>
    </li>
    <li>Click <strong>"Deploy"</strong>. Within 90 seconds, Vercel gives you a live production URL (e.g., <code>https://ai-mock-interview.vercel.app</code>).</li>
</ol>

<h3>Step 5: Update Clerk Production URLs</h3>
<p>In your Clerk Dashboard, navigate to <strong>Configure ➔ Domains</strong> and add your Vercel production domain. Update the redirect URLs to point to your live site.</p>

<!-- ========================================== -->
<!-- CHAPTER 16: TESTING, DEBUGGING &amp; TROUBLESHOOTING -->
<!-- ========================================== -->
<h1 id="ch16">CHAPTER 16: TESTING, DEBUGGING &amp; TROUBLESHOOTING</h1>

<h2>16.1 The Engineering Debugging Framework</h2>
<table>
    <thead>
        <tr>
            <th>Bug Category</th>
            <th>Primary Symptom</th>
            <th>Where to Inspect</th>
            <th>Resolution Technique</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Client UI Error</strong></td>
            <td>White screen or broken button</td>
            <td>Chrome DevTools ➔ <code>Console</code> Tab</td>
            <td>Inspect stack trace for undefined variables or broken React hooks.</td>
        </tr>
        <tr>
            <td><strong>API Failure</strong></td>
            <td>"Failed to generate questions" toast</td>
            <td>Chrome DevTools ➔ <code>Network</code> Tab</td>
            <td>Select the red request (e.g., <code>generate-interview-questions</code>), view <em>Payload</em> and <em>Response</em>.</td>
        </tr>
        <tr>
            <td><strong>Serverless Timeout</strong></td>
            <td>HTTP 504 Gateway Timeout</td>
            <td>Vercel Runtime Logs / Terminal</td>
            <td>Verify if the external AI service exceeded the 10-second serverless execution limit.</td>
        </tr>
        <tr>
            <td><strong>Database Permission</strong></td>
            <td>Null returned from query</td>
            <td><code>npx convex dashboard</code></td>
            <td>Verify user ID authorization check in <code>convex/Interview.ts</code>.</td>
        </tr>
    </tbody>
</table>

<h2>16.2 Pre-Viva Health Check Checklist</h2>
<ul>
    <li>[x] <strong>Run <code>npm run lint</code>:</strong> Ensures no unresolved ESLint warnings.</li>
    <li>[x] <strong>Run <code>npx tsc --noEmit</code>:</strong> Verifies complete TypeScript type safety across all files.</li>
    <li>[x] <strong>Test Camera &amp; Mic in Incognito:</strong> Ensures permission prompts pop up correctly on fresh sessions.</li>
    <li>[x] <strong>Verify Network Tab:</strong> Ensure no unhandled 400/500 errors appear when creating an interview.</li>
</ul>

<!-- ========================================== -->
<!-- CHAPTER 17: IMPORTANT SOURCE CODE EXPLANATIONS -->
<!-- ========================================== -->
<h1 id="ch17">CHAPTER 17: IMPORTANT SOURCE CODE EXPLANATIONS</h1>

<h2>17.1 Walkthrough 1: <code>CreateInterviewDialog.tsx</code></h2>
<p><strong>Path:</strong> <code>app/(routes)/_components/CreateInterviewDialog.tsx</code></p>
<p>
    This file controls the primary entry funnel. Key logic:
</p>
<ul>
    <li><strong>Controlled State:</strong> Uses <code>useState</code> hooks to manage <code>jobTitle</code>, <code>techStack</code>, and <code>file</code>.</li>
    <li><strong>Multi-part Payload:</strong> Packages binary resume PDF into <code>new FormData()</code> to enable simultaneous transmission of file buffers and text fields.</li>
    <li><strong>Convex Session Insertion:</strong> Executes <code>saveInterviewQuestion({ questions, resumeUrl, uid })</code> to write the session into Convex and navigates to <code>/interview/[id]</code>.</li>
</ul>

<h2>17.2 Walkthrough 2: <code>lib/roleInterviewerEngine.ts</code></h2>
<p><strong>Path:</strong> <code>lib/roleInterviewerEngine.ts</code></p>
<p>
    The core intellectual property of the project. Contains:
</p>
<ul>
    <li><strong><code>normalizeRole(role, stack)</code>:</strong> Uses string heuristics to map user input into 13 standardized engineering categories (e.g., <code>frontend_developer</code>, <code>devops_engineer</code>).</li>
    <li><strong><code>generateRoleAwareQuestions(...)</code>:</strong> Assembles an 8-phase progressive question bank ranging from simple icebreakers (Phase 1) to architecture deep dives (Phase 4) and STAR behavioral challenges (Phase 6).</li>
    <li><strong><code>generateAdaptiveFollowUp(...)</code>:</strong> Dispatches HTTP POST to Google Gemini 1.5 Flash with a 7000ms timeout and catches errors with seamless rule-engine fallback.</li>
</ul>

<h2>17.3 Walkthrough 3: <code>start/page.tsx</code> (Live Room Engine)</h2>
<p><strong>Path:</strong> <code>app/(routes)/interview/[interviewId]/start/page.tsx</code></p>
<p>
    The central interactive execution engine:
</p>
<ul>
    <li><strong>MediaRecorder Setup:</strong> Captures audio/video chunks and buffers them into IndexedDB via <code>saveRecordingBlob()</code>.</li>
    <li><strong>Web Speech STT/TTS:</strong> Synchronizes text-to-speech audio with the visual question indicator and starts <code>webkitSpeechRecognition</code> once the AI finishes speaking.</li>
    <li><strong>Vision Interval:</strong> A 1000ms <code>setInterval</code> triggers <code>analyzeVideoFrame(videoRef.current)</code> to calculate centering and eye contact.</li>
</ul>

<h2>17.4 Walkthrough 4: <code>app/api/interview-feedback/route.tsx</code></h2>
<p><strong>Path:</strong> <code>app/api/interview-feedback/route.tsx</code></p>
<p>
    The evaluation engine:
</p>
<ul>
    <li><strong>Deterministic Text Analysis:</strong> Splits candidate speech into word arrays, searches for domain keywords, and flags missing technical concepts.</li>
    <li><strong>Verbal Filler Detection:</strong> Uses regex pattern matching to count instances of <em>"um"</em>, <em>"uh"</em>, <em>"like"</em>, <em>"you know"</em>.</li>
    <li><strong>STAR Transformation:</strong> Automatically restructures the candidate's answer into Situation, Task, Action, and Result formatting for feedback comparison.</li>
</ul>

<h2>17.5 Walkthrough 5: <code>utils/recordingStorage.ts</code></h2>
<p><strong>Path:</strong> <code>utils/recordingStorage.ts</code></p>
<p>
    Manages browser-side persistence:
</p>
<ul>
    <li>Opens an IndexedDB database named <code>MAPD_Interview_Recordings_DB</code>.</li>
    <li>Stores the recording blob under the key <code>interviewId</code>.</li>
    <li>Provides <code>uploadRecordingBlob()</code> which dispatches a POST request to <code>/api/upload-recording</code> with cloud fallback.</li>
</ul>
"""

print("Content Part 4 (Chapters 15 to 17) Loaded.")
