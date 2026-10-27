# -*- coding: utf-8 -*-
"""
Content Part 3: Chapters 11 to 14
"""

CHAPTER_11_14 = """
<!-- ========================================== -->
<!-- CHAPTER 11: ARTIFICIAL INTELLIGENCE INTEGRATION -->
<!-- ========================================== -->
<h1 id="ch11">CHAPTER 11: ARTIFICIAL INTELLIGENCE INTEGRATION</h1>

<h2>11.1 AI Model &amp; Architecture Overview</h2>
<p>
    The application integrates <strong>Google Gemini 1.5 Flash</strong> (<code>gemini-1.5-flash</code>) using standard HTTP REST requests. It does not require a bulky Python server or external AI gateway; it communicates directly from the Next.js serverless API route to Google's official REST endpoint:
</p>
<pre><code>https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}</code></pre>

<h2>11.2 Normal Application Logic vs. AI-Generated Output</h2>
<p>
    An intelligent architectural decision in this project is separating <strong>predictable application logic</strong> from <strong>generative AI output</strong>:
</p>
<table>
    <thead>
        <tr>
            <th>System Component</th>
            <th>Mechanism Used</th>
            <th>Why this Design Choice was Made</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Initial 8-Phase Questions</strong></td>
            <td>Deterministic Rule Engine (<code>lib/roleInterviewerEngine.ts</code>)</td>
            <td>Ensures guaranteed high-quality questions structured across 13 engineering domains with 0ms latency and 0 API cost.</td>
        </tr>
        <tr>
            <td><strong>Adaptive Follow-up Probing</strong></td>
            <td>Google Gemini 1.5 Flash (Generative AI)</td>
            <td>Candidate answers are unpredictable; Gemini dynamically analyzes their spoken words to probe deeper into concepts.</td>
        </tr>
        <tr>
            <td><strong>Post-Interview Scoring</strong></td>
            <td>Transcript Evidence Matching (Deterministic Algorithm)</td>
            <td>Eliminates LLM hallucinations. If the candidate never spoke a keyword, they don't get artificial points.</td>
        </tr>
    </tbody>
</table>

<h2>11.3 How the Gemini Prompt is Engineered</h2>
<p>
    The prompt in [`lib/roleInterviewerEngine.ts`](file:///c:/Users/Deekshitha%20P/Documents/AI-Mock-Interview-2.0-main/lib/roleInterviewerEngine.ts#L391-L415) instructs Gemini to act as a structured technical interviewer:
</p>
<pre><code>const geminiPrompt = `You are a professional, friendly, and highly intelligent technical interviewer interviewing a candidate for the role of ${cleanRole}.
Tech Stack context: ${cleanStack}.

The interview is currently in Phase ${currentPhase} (out of 8 phases).
Question just asked: "${currentQuestion}"
Candidate's actual spoken answer: "${candidateAnswer}"

Analyze the candidate's answer:
1. Did they answer well and mention specific technologies/frameworks?
2. Did they struggle, hesitate, or say "I don't know"?
3. Is a targeted, probing follow-up question appropriate?

Respond with ONLY a raw JSON object (no markdown, no backticks):
{
  "hasFollowUp": true or false,
  "followUpQuestion": "A concise, natural 1-2 sentence probing follow-up or pivot question",
  "detectedKeywords": ["keyword1", "keyword2"],
  "reason": "brief reason for this follow-up"
}`;</code></pre>

<h2>11.4 Graceful Failure &amp; Offline Fallback</h2>
<p>
    What happens if the candidate's internet disconnects, or the Google Gemini API key runs out of free tier quota?
</p>
<ul>
    <li>In <code>lib/roleInterviewerEngine.ts</code>, the Axios call is configured with a <strong>7000ms timeout</strong>.</li>
    <li>If the call throws an error or exceeds 7 seconds, the <code>catch (geminiErr)</code> block logs a notice and immediately routes the candidate to the local keyword matching engine.</li>
    <li>If the candidate said <em>"I don't know"</em>, the local engine smoothly pivots to another topic: <em>"No problem at all! Let's pivot to another core area..."</em></li>
    <li>The candidate's interview session <strong>never crashes</strong>, guaranteeing 100% test reliability.</li>
</ul>

<!-- ========================================== -->
<!-- CHAPTER 12: INTERVIEW RECORDING, CAMERA &amp; MIC -->
<!-- ========================================== -->
<h1 id="ch12">CHAPTER 12: RECORDING, CAMERA, MIC &amp; VISION TELEMETRY</h1>

<h2>12.1 Hardware Permissions &amp; Video Capture</h2>
<p>
    When a candidate enters the interview lobby, the application calls the standard browser MediaDevices API:
</p>
<pre><code>const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
    audio: true
});
videoRef.current.srcObject = stream;</code></pre>

<h2>12.2 Real-Time Speech Synthesis (TTS) &amp; Speech Recognition (STT)</h2>
<ul>
    <li><strong>Text-to-Speech (TTS):</strong> Uses <code>window.speechSynthesis</code>. In <code>utils/interviewerConfig.ts</code>, the app inspects installed system voices. If the candidate selected a Male interviewer (Alex Vance), it filters for keywords like <em>"David", "Mark", "Guy"</em>. If Female (Sarah Jenkins), it selects <em>"Zira", "Samantha", "Victoria"</em>.</li>
    <li><strong>Speech-to-Text (STT):</strong> Uses <code>window.webkitSpeechRecognition</code>. When the AI finishes speaking, the microphone activates in continuous mode, transcribing the candidate's voice into the text input area in real time.</li>
</ul>

<h2>12.3 HTML5 Canvas 2D Vision Telemetry</h2>
<p>
    Unlike heavy AI vision models that require downloading 50MB tensor weights, MAPD implements an ultra-fast (&lt;2ms) frame-sampling heuristic in [`utils/facialAnalysis.ts`](file:///c:/Users/Deekshitha%20P/Documents/AI-Mock-Interview-2.0-main/utils/facialAnalysis.ts):
</p>
<ol>
    <li>Every 1000ms, an in-memory <code>&lt;canvas&gt;</code> draws the current webcam frame downscaled to 320x240 pixels.</li>
    <li>The function extracts the raw RGBA pixel buffer using <code>ctx.getImageData()</code>.</li>
    <li>It computes average pixel luminance:
        <pre><code>const lum = 0.299 * r + 0.587 * g + 0.114 * b;</code></pre>
        If average luminance is below 45, it flags <em>"Too Dark"</em>; if above 210, it flags <em>"Overexposed"</em>.
    </li>
    <li>It identifies skin pixels using RGB ratio heuristics (<code>r &gt; 60 &amp;&amp; g &gt; 40 &amp;&amp; r &gt; g</code>) and calculates the centroid center-of-mass (<code>skinCenterX</code>, <code>skinCenterY</code>). If the centroid drifts too far from the center, it warns the user: <em>"Looking Away"</em> or <em>"Slight Tilt"</em>.</li>
</ol>

<h2>12.4 Dual-Tier Video Storage Architecture</h2>
<p>
    Streaming high-definition video over unpredictable home internet connections often leads to packet loss. MAPD solves this using a <strong>dual-tier storage design</strong>:
</p>
<pre><code>[ MediaRecorder API ]
       │
       ▼ (1. Instant local persistence)
[ Browser IndexedDB: MAPD_Interview_Recordings_DB ] ──► Zero-Loss Local Buffer
       │
       ▼ (2. Background chunk upload after interview)
[ Next.js Serverless Route: /api/upload-recording ]
       │
       ├──► Tier 1: Supabase Storage Bucket ('interview-recordings')
       ├──► Tier 2: ImageKit Cloud Media Storage
       ├──► Tier 3: Convex Cloud Object Storage (ctx.storage)
       └──► Tier 4: Local Server Disk Fallback ('public/uploads/recordings')</code></pre>

<!-- ========================================== -->
<!-- CHAPTER 13: COMPLETE END-TO-END EXECUTION TRACE -->
<!-- ========================================== -->
<h1 id="ch13">CHAPTER 13: COMPLETE END-TO-END EXECUTION TRACE</h1>

<p>
    Below is the complete, 15-step trace of what happens when a candidate signs up, configures an interview, speaks their answers, and views their feedback.
</p>

<table>
    <thead>
        <tr>
            <th>Step</th>
            <th>User Action / System Event</th>
            <th>Source File &amp; Function</th>
            <th>Data Transferred</th>
            <th>Returned Output / Result</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>1</strong></td>
            <td>User visits application landing page</td>
            <td><code>app/page.tsx</code>, <code>middleware.ts</code></td>
            <td>HTTP GET Request</td>
            <td>Renders public Hero section</td>
        </tr>
        <tr>
            <td><strong>2</strong></td>
            <td>User signs in via Google / Email</td>
            <td><code>app/(auth)/sign-in/*</code></td>
            <td>OAuth Credentials</td>
            <td>Clerk issues cryptographically signed JWT cookie</td>
        </tr>
        <tr>
            <td><strong>3</strong></td>
            <td>User synced to Convex database</td>
            <td><code>app/Provider.tsx</code> ➔ <code>CreateNewUser</code></td>
            <td>Email, Name, Image URL</td>
            <td>Inserts or returns <code>UserTable._id</code></td>
        </tr>
        <tr>
            <td><strong>4</strong></td>
            <td>Clicks "+ Create Interview" in dashboard</td>
            <td><code>CreateInterviewDialog.tsx</code></td>
            <td>UI State: <code>setOpen(true)</code></td>
            <td>Modal dialog opens on screen</td>
        </tr>
        <tr>
            <td><strong>5</strong></td>
            <td>Fills role, tech stack &amp; attaches PDF resume</td>
            <td><code>CreateInterviewDialog.tsx</code></td>
            <td>Role, Stack, Experience, File</td>
            <td>Validates PDF &lt; 10MB; enables submit button</td>
        </tr>
        <tr>
            <td><strong>6</strong></td>
            <td>Submits form to generate questions</td>
            <td><code>/api/generate-interview-questions</code></td>
            <td>FormData (multipart)</td>
            <td>Uploads PDF to ImageKit; generates 8 questions</td>
        </tr>
        <tr>
            <td><strong>7</strong></td>
            <td>Saves interview record into database</td>
            <td><code>convex/Interview.ts</code> ➔ <code>SaveInterviewQuestion</code></td>
            <td>Questions array, user ID, details</td>
            <td>Convex creates row; returns <code>interviewId</code></td>
        </tr>
        <tr>
            <td><strong>8</strong></td>
            <td>Redirected to Interview Lobby</td>
            <td><code>interview/[interviewId]/page.tsx</code></td>
            <td><code>router.push('/interview/' + id)</code></td>
            <td>Tests camera/mic; chooses interviewer persona</td>
        </tr>
        <tr>
            <td><strong>9</strong></td>
            <td>Enters Live Interview Room</td>
            <td><code>interview/[interviewId]/start/page.tsx</code></td>
            <td>Starts Web Speech TTS + MediaRecorder</td>
            <td>Interviewer persona speaks Question 1 out loud</td>
        </tr>
        <tr>
            <td><strong>10</strong></td>
            <td>Candidate speaks answer into microphone</td>
            <td><code>start/page.tsx</code> (STT Recognition)</td>
            <td>Continuous audio stream</td>
            <td>Displays real-time transcribed text on screen</td>
        </tr>
        <tr>
            <td><strong>11</strong></td>
            <td>Submits answer &amp; requests AI follow-up</td>
            <td><code>/api/generate-followup-question</code></td>
            <td>Question + Spoken Answer</td>
            <td>Gemini 1.5 Flash returns adaptive follow-up question</td>
        </tr>
        <tr>
            <td><strong>12</strong></td>
            <td>Canvas analyzes camera video frame</td>
            <td><code>utils/facialAnalysis.ts</code></td>
            <td>HTMLVideoElement frame data</td>
            <td>Updates posture metric (Centered / Slouch / Eyes)</td>
        </tr>
        <tr>
            <td><strong>13</strong></td>
            <td>Interview completed; Video saved locally</td>
            <td><code>utils/recordingStorage.ts</code></td>
            <td>MediaRecorder blob</td>
            <td>Stores full recording in browser IndexedDB</td>
        </tr>
        <tr>
            <td><strong>14</strong></td>
            <td>Video uploaded &amp; Transcript graded</td>
            <td><code>/api/upload-recording</code>, <code>/api/interview-feedback</code></td>
            <td>Video blob + Transcript array</td>
            <td>Scores technical accuracy, fillers &amp; STAR answers</td>
        </tr>
        <tr>
            <td><strong>15</strong></td>
            <td>Candidate views interactive scorecard</td>
            <td><code>interview/[interviewId]/feedback/page.tsx</code></td>
            <td>Reads feedback from Convex</td>
            <td>Displays scores, STAR answers &amp; video playback</td>
        </tr>
    </tbody>
</table>

<!-- ========================================== -->
<!-- CHAPTER 14: RUNNING THE PROJECT LOCALLY (WINDOWS) -->
<!-- ========================================== -->
<h1 id="ch14">CHAPTER 14: RUNNING LOCALLY ON WINDOWS (STEP-BY-STEP)</h1>

<p>
    Follow these exact, verified commands to run the project locally on a Windows operating system:
</p>

<h2>14.1 Step 1: Open PowerShell or Command Prompt</h2>
<pre><code># Check that your working directory is the project folder
cd "C:\\Users\\Deekshitha P\\Documents\\AI-Mock-Interview-2.0-main"</code></pre>

<h2>14.2 Step 2: Install Node Modules</h2>
<pre><code>npm install</code></pre>
<p>
    <em>Note:</em> If you encounter permission issues on Windows, run PowerShell as Administrator or execute <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code>.
</p>

<h2>14.3 Step 3: Configure Environment Variables</h2>
<p>
    Ensure a file named <code>.env.local</code> exists in the root directory with the following structure:
</p>
<pre><code># Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Convex Database URL
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud

# AI Model Key
GEMINI_API_KEY=AIzaSy...

# Optional Cloud Storage (ImageKit / Supabase)
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...
IMAGEKIT_URL_PUBLIC_KEY=public_...
IMAGEKIT_URL_PRIVATE_KEY=private_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...</code></pre>

<h2>14.4 Step 4: Run Convex Development Engine</h2>
<p>
    Open a terminal window and start the Convex reactive backend:
</p>
<pre><code>npx convex dev</code></pre>

<h2>14.5 Step 5: Start the Next.js Development Server</h2>
<p>
    Open a second terminal window and run:
</p>
<pre><code>npm run dev</code></pre>
<p>
    Open your browser and navigate to <strong>http://localhost:3000</strong>.
</p>

<h2>14.6 Troubleshooting Common Windows Errors</h2>
<ul>
    <li><strong>Port 3000 is already in use:</strong> Run <code>Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force</code> in PowerShell.</li>
    <li><strong>Microphone / Camera blocked:</strong> In Google Chrome, click the padlock icon in the address bar (next to <code>localhost:3000</code>) and set Camera and Microphone to <em>"Allow"</em>.</li>
</ul>
"""

print("Content Part 3 (Chapters 11 to 14) Loaded.")
