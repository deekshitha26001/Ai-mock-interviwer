import os
import sys
import subprocess

print("Executing comprehensive handbook builder...")

workspace_dir = r"c:\Users\Deekshitha P\Documents\AI-Mock-Interview-2.0-main"
artifact_dir = r"C:\Users\Deekshitha P\.gemini\antigravity-ide\brain\e7677e5d-4aa3-432e-bb51-c341918fe57d"

md_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.md")
html_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.html")
pdf_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.pdf")
artifact_md_path = os.path.join(artifact_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.md")

os.makedirs(artifact_dir, exist_ok=True)

# Build text file incrementally to ensure memory safety
with open(md_path, "w", encoding="utf-8") as f:
    f.write("""# MAPD AI MOCK INTERVIEW 2.0
## Complete Master Project Documentation & Technical Interview Preparation Handbook

> **Target Workspace:** `AI-Mock-Interview-2.0-main`  
> **Repository:** MAPD Technical Recruiter & AI Mock Interview Practice Platform  
> **Prepared For:** Technical & HR Interview Excellence  
> **Author / Maintainer:** Candidate Interview Preparation Guide  

---

# TABLE OF CONTENTS
1. [PROJECT OVERVIEW](#1-project-overview)
2. [COMPLETE TECHNOLOGY STACK](#2-complete-technology-stack)
3. [PROJECT ARCHITECTURE](#3-project-architecture)
4. [SYSTEM ARCHITECTURE DIAGRAMS](#4-system-architecture-diagrams)
5. [COMPLETE FOLDER STRUCTURE](#5-complete-folder-structure)
6. [FRONTEND DEEP EXPLANATION](#6-frontend-deep-explanation)
7. [BACKEND DEEP EXPLANATION](#7-backend-deep-explanation)
8. [DATABASE DEEP DIVE](#8-database-deep-dive)
9. [AUTHENTICATION & SECURITY](#9-authentication--security)
10. [AI / MACHINE LEARNING FEATURES](#10-ai--machine-learning-features)
11. [API DOCUMENTATION](#11-api-documentation)
12. [COMPLETE DATA FLOW](#12-complete-data-flow)
13. [IMPORTANT CODE EXPLANATION](#13-important-code-explanation)
14. [DESIGN DECISIONS](#14-design-decisions)
15. [ERROR HANDLING](#15-error-handling)
16. [TESTING](#16-testing)
17. [DEPLOYMENT](#17-deployment)
18. [GITHUB & VERSION CONTROL](#18-github--version-control)
19. [PERFORMANCE OPTIMIZATION](#19-performance-optimization)
20. [SCALABILITY](#20-scalability)
21. [PROJECT LIMITATIONS](#21-project-limitations)
22. [FUTURE ENHANCEMENTS](#22-future-enhancements)
23. [RECRUITER & INTERVIEW QUESTION BANK](#23-recruiter--interview-question-bank)
24. [DIFFICULT CROSS-QUESTIONS](#24-difficult-cross-questions)
25. ["INTERVIEWER OPENS YOUR GITHUB" CHECKLIST](#25-interviewer-opens-your-github-checklist)
26. ["EXPLAIN THIS CODE ON A WHITEBOARD"](#26-explain-this-code-on-a-whiteboard)
27. [COMPLEXITY ANALYSIS](#27-complexity-analysis)
28. [REAL INTERVIEW SIMULATION](#28-real-interview-simulation)
29. [QUESTIONS I SHOULD NEVER ANSWER INCORRECTLY](#29-questions-i-should-never-answer-incorrectly)
30. [1-DAY PROJECT PREPARATION PLAN](#30-1-day-project-preparation-plan)
31. [7-DAY PROJECT MASTERY PLAN](#31-7-day-project-mastery-plan)
32. [SIMPLE ENGLISH CHEAT SHEET](#32-simple-english-cheat-sheet)
33. [PROJECT VOCABULARY GLOSSARY](#33-project-vocabulary-glossary)
34. [HONESTY & AI-ASSISTED DEVELOPMENT](#34-honesty--ai-assisted-development)
35. [FINAL PROJECT MASTER SUMMARY](#35-final-project-master-summary)
36. [DOCUMENTATION & PDF QUALITY REQUIREMENTS](#36-documentation--pdf-quality-requirements)

---

# 1. PROJECT OVERVIEW

### 1. Itemized Specifications
1. **Project Name:** `ai-mock-interview-app` (Public Title: MAPD AI Mock Interview 2.0)
2. **One-Line Description:** An AI-powered mock technical interview platform featuring role-aware adaptive question progression, live voice interaction, real-time facial computer vision telemetry, grounded transcript evaluation, and multi-tier cloud video recording persistence.
3. **Problem Statement:** Traditional interview preparation relies on static, generic question lists or expensive human mock interviews. Candidates lack real-time technical feedback, role-specific adaptive follow-ups, objective speech pace/verbal filler analysis, and visual composure assessment.
4. **Why Built:** Built to empower computer science students and software job seekers with a realistic, accessible, and objective environment to practice domain-specific technical interviews, receive actionable transcript-grounded feedback, and track improvement over time.
5. **Main Objective:** Automate end-to-end technical interview simulation with zero-hallucination transcript evaluation, role-customized 8-phase question progressions, and transparent scoring formulas.
6. **Target Users:** Software engineering candidates, computer science students, frontend/backend/full-stack developers, AI/ML engineers, data analysts, DevOps engineers, and technical recruiters conducting automated candidate assessments.
7. **Main Features:**
   - **Role-Aware 8-Phase Question Engine:** Generates customized question trajectories (Intro -> Fundamentals -> Intermediate -> Coding/Logic -> Candidate Project -> Tech Stack Deep-Dive -> Scenarios -> HR/STAR).
   - **Adaptive Real-Time Follow-Up Engine:** Evaluates candidate answers via Gemini 1.5 Flash API with rule-based fallback to probe specific technologies or pivot when candidates struggle.
   - **Speech Interaction & Avatar Voice:** Web Speech API integration supporting Alex Vance (Male AI) and Sarah Jenkins (Female AI) with real-time speech recognition.
   - **Real-Time Computer Vision Telemetry:** Canvas 2D frame sampling tracking eye contact %, head pose status, stress index, confidence score, and perceived lighting.
   - **Unified Multi-Tier Storage Manager:** Local IndexedDB offline buffer combined with Convex Cloud, Supabase Storage, ImageKit Object Storage, and Node disk storage fallback.
   - **Transcript-Grounded Feedback & Verbal Analytics:** Automated filler word analysis (um, uh, like), WPM speaking rate, STAR model answers, and transparent weighted scoring (Tech 35%, Problem Solving 25%, Relevance 15%, Completeness 15%, Communication 10%).
   - **Candidate Dashboard & Analytics:** Filters by role/status/score, saved flashcards, score trajectory analytics, and recruiter report export.
8. **Key Technologies:** Next.js 15, React 19, TypeScript, Convex DB, Clerk Auth, Gemini 1.5 Flash, ImageKit, Supabase, Arcjet, Tailwind CSS v4, Web Speech API, Canvas 2D.
9. **Frontend Technologies:** Next.js 15 App Router, React 19, Tailwind CSS v4, Lucide React, Shadcn UI / Radix UI, Motion (Framer Motion), Next-Themes, Sonner.
10. **Backend Technologies:** Next.js API Routes (`app/api/*`), Convex Serverless Mutations/Queries (`convex/*`), Node.js buffer handling, Axios, ImageKit Node SDK, Supabase JS Client, Arcjet Next SDK.
11. **Database:** Convex Serverless Reactive Document Database (`schema.ts`).
12. **AI/ML Technologies:** Google Gemini 1.5 Flash REST API (`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash`), Custom Canvas 2D Heuristic Computer Vision, Web Speech API, Rule-Based Natural Language Engine (`lib/roleInterviewerEngine.ts`).
13. **APIs Used:** Google Gemini REST API, ImageKit Upload/Delete API, Supabase Storage API, Convex WebSocket & Storage API, Arcjet Rate Limiting API, Akool OpenAPI v4.
14. **Authentication/Authorization:** Clerk Authentication (`@clerk/nextjs`, `middleware.ts`, `Provider.tsx`), Server-side user ownership checks in Convex mutations & API routes.
15. **File/Storage Systems:** IndexedDB (`MAPD_Interview_Recordings_DB`), Convex Storage (`ctx.storage`), Supabase Storage (`interview-recordings` bucket), ImageKit Cloud Storage (`/recordings/`), Node `fs` local disk (`public/uploads/recordings`).
16. **Deployment Technologies:** Vercel / Netlify (`netlify.toml`, `@netlify/plugin-nextjs`, `vercel.json`).
17. **Development Tools:** Node.js 24, TypeScript 5, npm, PostCSS, ESLint, Tailwind PostCSS plugin.
18. **Version Information:** Next.js `15.4.10`, React `19.1.0`, Convex `1.25.4`, Clerk `6.39.7`, Supabase JS `2.53.0`, ImageKit `6.0.0`, Arcjet Next `1.0.0-beta.10`.

---

### 2. "Tell Me About Your Project" - Interview Elevator Pitches

#### 30-Second Answer:
> "MAPD AI Mock Interview 2.0 is a full-stack Next.js 15 web application designed to simulate technical interviews for software engineering roles. It generates role-specific 8-phase question progressions, conducts live speech interviews with AI persona voices, and performs real-time computer vision frame analysis to monitor candidate composure. After the interview, it delivers a transcript-grounded evaluation report with verbal filler metrics, WPM speaking pace, STAR feedback model answers, and multi-cloud video recording playback. I built it using Next.js 15, React 19, TypeScript, Convex serverless DB, Clerk authentication, Gemini 1.5 Flash API, and Tailwind CSS v4."

#### 1-Minute Answer:
> "My project is MAPD AI Mock Interview 2.0, a complete technical interview preparation platform. The core problem it solves is that standard interview tools give static questions without evaluating how candidates actually explain concepts aloud or handle unexpected follow-ups.
> 
> In my application, candidates select their target role and tech stack. The system uses a role-intelligence engine to structure an 8-phase interview progression—covering fundamentals, coding logic, project deep-dives, and real-world production scenarios. During the session, the app records candidate speech via Web Speech API, analyzes webcam posture and eye contact using Canvas 2D pixel sampling, and streams video chunks to local IndexedDB and cloud storage.
> 
> Once finished, an automated feedback engine analyzes the candidate's actual spoken transcript to evaluate technical correctness, detect filler words like 'um' or 'like', calculate speaking WPM, and generate a weighted score. The tech stack includes Next.js 15 App Router, TypeScript, Convex serverless database, Clerk auth, Gemini 1.5 Flash, ImageKit, Supabase, and Tailwind CSS v4."

#### 2-Minute Detailed Answer:
> "MAPD AI Mock Interview 2.0 is an enterprise-grade AI technical recruiter and candidate interview practice platform. It addresses the challenge that engineering candidates struggle with articulating technical concepts clearly under realistic interview conditions.
> 
> From an architectural standpoint, the application is built on Next.js 15 App Router and React 19. Authentication is secured via Clerk middleware. When a user creates an interview, the backend `lib/roleInterviewerEngine.ts` normalizes the job role and generates an 8-phase interview trajectory tailored specifically to their stack—such as Java Spring Boot, React Frontend, or Python Data Science.
> 
> During the live interview, the frontend manages multiple asynchronous subsystems:
> 1. **Voice & Speech Engine:** Synthesizes AI questions using Web Speech API with gender-matched persona voices (Alex Vance or Sarah Jenkins) and transcribes candidate answers in real time.
> 2. **Adaptive Follow-Up Engine:** Calls Google Gemini 1.5 Flash API to evaluate candidate answers dynamically. If the candidate mentions specific tech keywords like 'JWT' or 'Docker', it probes deeper. If the candidate struggles or says 'I don't know', it gracefully pivots without repeating questions.
> 3. **Computer Vision Telemetry:** Samples video frames using Canvas 2D context to track face centroids, computing real-time eye contact %, head pose status, stress index, and confidence score without uploading raw video streams to third-party vision APIs.
> 4. **Resilient Recording Pipeline:** Captures `video/webm` streams via `MediaRecorder`, buffering them in local IndexedDB (`MAPD_Interview_Recordings_DB`) for zero-loss offline protection, before uploading to Convex Cloud Storage, Supabase Storage, or ImageKit.
> 
> Finally, the feedback engine runs transcript-grounded analysis. Rather than hallucinating scores, it evaluates actual candidate quotes against technical requirements, counts verbal fillers, calculates WPM pace, provides STAR-formatted model answers, and computes an overall weighted score. Data is reactively stored in Convex DB and rendered on an interactive candidate dashboard with score trajectory analytics."

---
""")

print("Header & Section 1 written.")
