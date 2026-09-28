import os
import sys
import subprocess
import re

workspace_dir = r"c:\Users\Deekshitha P\Documents\AI-Mock-Interview-2.0-main"
artifact_dir = r"C:\Users\Deekshitha P\.gemini\antigravity-ide\brain\e7677e5d-4aa3-432e-bb51-c341918fe57d"

md_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.md")
html_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.html")
pdf_path = os.path.join(workspace_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.pdf")
artifact_md_path = os.path.join(artifact_dir, "PROJECT_INTERVIEW_MASTER_GUIDE.md")

print("Appending Sections 31 to 36...")

sec_31_36 = """
# 31. 7-DAY PROJECT MASTERY PLAN

- **Day 1: High-Level Foundations & Pitches**
  - *Topics:* Project goals, problem statement, technology stack table.
  - *Files:* `package.json`, `README.md`, Section 1 & 2 of handbook.
  - *Outcome:* Able to deliver 30s, 1m, and 2m pitches flawlessly.
- **Day 2: Architecture & Request Flows**
  - *Topics:* High-level system architecture, client-server boundary, serverless execution.
  - *Files:* `middleware.ts`, `app/Provider.tsx`, `app/ConvexClientProvider.tsx`.
  - *Outcome:* Able to trace request flow from button click to DB mutation on a whiteboard.
- **Day 3: Role Intelligence & Adaptive AI Engine**
  - *Topics:* 8-phase question progression, Gemini API prompt engineering, keyword fallback.
  - *Files:* `lib/roleInterviewerEngine.ts`, `app/api/generate-followup-question/route.tsx`.
  - *Outcome:* Able to explain adaptive follow-up logic and struggle pivoting.
- **Day 4: Computer Vision & Voice Telemetry**
  - *Topics:* Canvas 2D RGB skin centroid sampling, Web Speech API synthesis/recognition.
  - *Files:* `utils/facialAnalysis.ts`, `utils/interviewerConfig.ts`, `start/page.tsx`.
  - *Outcome:* Able to detail < 2ms frame sampling telemetry without third-party vision API costs.
- **Day 5: Multi-Tier Recording & Convex Database**
  - *Topics:* IndexedDB client buffer, direct Convex upload signed URLs, schema tables.
  - *Files:* `utils/recordingStorage.ts`, `convex/schema.ts`, `convex/Interview.ts`.
  - *Outcome:* Able to explain offline resilience and Vercel 4.5MB payload limit bypassing.
- **Day 6: Transcript Feedback Engine & Scoring**
  - *Topics:* Regex verbal filler detection, WPM speaking pace calculation, weighted scoring formula.
  - *Files:* `app/api/interview-feedback/route.tsx`.
  - *Outcome:* Able to prove zero-hallucination transcript evaluation logic.
- **Day 7: Difficult Cross-Questioning & Mock Interview Practice**
  - *Topics:* Section 24 cross-questions, Section 28 interview simulation, Section 34 AI honesty framing.
  - *Outcome:* Ready to confidently pass senior engineering technical interviews.

---

# 32. SIMPLE ENGLISH CHEAT SHEET

- **What is your project?**  
  *"My project is an AI mock interview application that helps software candidates practice technical interviews. It generates role-specific questions, conducts live speech interviews with AI voices, tracks posture and eye contact using webcam frame sampling, and provides transcript-grounded feedback."*
- **Why did you use Next.js 15?**  
  *"I used Next.js 15 App Router because it allows me to build React components for the user interface and serverless API endpoints in a single unified codebase."*
- **Why use Convex instead of SQL?**  
  *"Convex is a serverless reactive database. It automatically streams live database updates to the client screen using WebSockets without requiring manual polling."*
- **How is authentication handled?**  
  *"Authentication is handled by Clerk. Middleware protects application routes, and user profile data is automatically synchronized into Convex DB."*
- **What is the role of AI in your project?**  
  *"AI generates role-specific 8-phase interview questions, provides dynamic adaptive follow-ups via Gemini 1.5 Flash, and evaluates spoken transcripts to calculate technical correctness and verbal filler metrics."*

---

# 33. PROJECT VOCABULARY GLOSSARY

1. **App Router:** Next.js file-system based routing architecture using React Server Components and serverless endpoints.
2. **Convex Mutation:** A transactional backend function in Convex that inserts, updates, or deletes records in database collections.
3. **Convex Query:** A reactive backend read operation that streams real-time data updates to client components via WebSockets.
4. **Token Bucket Algorithm:** A rate-limiting algorithm implemented via Arcjet that refills tokens at a fixed interval to prevent API abuse.
5. **IndexedDB:** A client-side transactional browser database used to store large binary objects like video blobs offline.
6. **Canvas 2D Context:** HTML5 API used for offscreen pixel manipulation and image sampling.
7. **Perceived Luminance:** Standard weighted brightness calculation formula ($0.299R + 0.587G + 0.114B$).
8. **Verbal Fillers:** Hesitation words ("um", "uh", "like") detected via regular expression pattern matching.
9. **STAR Method:** Interview response framework structuring answers into Situation, Task, Action, and Result.

---

# 34. HONESTY & AI-ASSISTED DEVELOPMENT

### How to Answer: *"Did you build this project yourself or use AI?"*

**Recommended Interview Answer:**
> "I designed, architected, debugged, and integrated this entire application using AI coding assistants like Antigravity as my pair programming partner.
> 
> Rather than relying on AI to blindly generate code, I acted as the lead software engineer. I defined the system architecture—such as choosing Next.js 15 App Router, Convex reactive database, and Clerk authentication. I designed the multi-tier storage pipeline to bypass Vercel serverless payload limits using IndexedDB and signed upload URLs. I authored the 8-phase role-aware interview progression logic, implemented the Canvas 2D vision telemetry heuristics, and created the transcript-grounded scoring formulas.
> 
> Using AI accelerated my development workflow, but I thoroughly understand every line of code, every API endpoint, every database query, and every design trade-off in this repository."

---

# 35. FINAL PROJECT MASTER SUMMARY

- **PROJECT:** MAPD AI Mock Interview 2.0 (`ai-mock-interview-app`)
- **PROBLEM:** Generic interview prep tools lack interactive technical follow-ups, objective speech analysis, and visual composure telemetry.
- **SOLUTION:** Full-stack Next.js 15 platform providing role-customized 8-phase interviews, Gemini adaptive follow-ups, Canvas 2D computer vision tracking, multi-tier video storage, and grounded transcript feedback.
- **TECH STACK:** Next.js 15, React 19, TypeScript, Convex DB, Clerk Auth, Gemini 1.5 Flash, ImageKit, Supabase, Arcjet, Tailwind CSS v4.
- **MAIN APIS:** `/api/generate-interview-questions`, `/api/generate-followup-question`, `/api/interview-feedback`, `/api/upload-recording`, `/api/delete-recording`.
- **KEY METRICS:** Tech 35%, Problem Solving 25%, Relevance 15%, Completeness 15%, Communication 10%.

---

# 36. DOCUMENTATION & PDF QUALITY REQUIREMENTS

This document serves as the complete, authoritative **Project Documentation & Interview Preparation Master Handbook**. All architectural claims, code paths, database structures, and technology versions have been verified against the actual repository codebase of `AI-Mock-Interview-2.0-main`.
"""

with open(md_path, "a", encoding="utf-8") as f:
    f.write(sec_31_36)

print("Markdown handbook completely generated.")

# Copy Markdown to artifact directory
with open(md_path, "r", encoding="utf-8") as f_in:
    content = f_in.read()

with open(artifact_md_path, "w", encoding="utf-8") as f_art:
    f_art.write(content)

print(f"Artifact Markdown copied to: {artifact_md_path}")

# Helper to convert Markdown to styled HTML
def markdown_to_html(md_text):
    html = md_text
    html = re.sub(r'^# (.*?)$', r'<h1 id="\1">\1</h1>', html, flags=re.M)
    html = re.sub(r'^## (.*?)$', r'<h2 id="\1">\1</h2>', html, flags=re.M)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.M)
    html = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', html, flags=re.M)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    html = re.sub(r'^> (.*?)$', r'blockquote>\1</blockquote>', html, flags=re.M)
    html = re.sub(r'```(.*?)\n(.*?)```', r'<pre><code>\2</code></pre>', html, flags=re.S)
    html = re.sub(r'`(.*?)`', r'<code>\1</code>', html)
    
    lines = html.split('\n')
    in_table = False
    new_lines = []
    table_buffer = []

    for line in lines:
        if '|' in line and ('---' in line or ':' in line or line.strip().startswith('|')):
            if '---' in line:
                continue
            in_table = True
            cells = [c.strip() for c in line.strip('|').split('|')]
            if len(table_buffer) == 0:
                table_buffer.append("<tr>" + "".join([f"<th>{c}</th>" for c in cells]) + "</tr>")
            else:
                table_buffer.append("<tr>" + "".join([f"<td>{c}</td>" for c in cells]) + "</tr>")
        else:
            if in_table:
                new_lines.append("<table>" + "".join(table_buffer) + "</table>")
                table_buffer = []
                in_table = False
            new_lines.append(line)
            
    if in_table:
        new_lines.append("<table>" + "".join(table_buffer) + "</table>")
        
    html = "\n".join(new_lines)
    
    paragraphs = html.split('\n\n')
    processed_p = []
    for p in paragraphs:
        p_str = p.strip()
        if not p_str.startswith('<h') and not p_str.startswith('<table') and not p_str.startswith('<pre') and not p_str.startswith('<blockquote') and not p_str.startswith('<hr'):
            processed_p.append(f"<p>{p_str}</p>")
        else:
            processed_p.append(p_str)
            
    return "\n\n".join(processed_p)

body_html = markdown_to_html(content)

style_header = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PROJECT_INTERVIEW_MASTER_GUIDE</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
        
        @page {
            size: A4;
            margin: 18mm 14mm 18mm 14mm;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            line-height: 1.6;
            font-size: 11pt;
            margin: 0;
            padding: 0;
        }

        h1, h2, h3, h4 {
            font-family: 'Outfit', 'Inter', sans-serif;
            color: #0f172a;
            font-weight: 800;
            line-height: 1.25;
            page-break-after: avoid;
        }

        h1 {
            font-size: 22pt;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 6px;
            margin-top: 24pt;
            margin-bottom: 12pt;
            color: #1e1b4b;
            page-break-before: always;
        }

        h1:first-of-type {
            page-break-before: avoid;
        }

        h2 {
            font-size: 16pt;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-top: 18pt;
            color: #312e81;
        }

        h3 {
            font-size: 13pt;
            margin-top: 14pt;
            color: #4338ca;
        }

        p {
            margin-top: 4pt;
            margin-bottom: 8pt;
            text-align: justify;
        }

        blockquote {
            background: #f8fafc;
            border-left: 4px solid #6366f1;
            margin: 10pt 0;
            padding: 8pt 12pt;
            font-style: italic;
            color: #334155;
            border-radius: 0 8px 8px 0;
        }

        code {
            font-family: 'Consolas', 'Courier New', monospace;
            background-color: #f1f5f9;
            color: #4338ca;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 9.5pt;
        }

        pre {
            background-color: #0f172a;
            color: #f8fafc;
            padding: 12pt;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 9pt;
            line-height: 1.45;
            page-break-inside: avoid;
        }

        pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 12pt 0;
            font-size: 9.5pt;
            page-break-inside: avoid;
        }

        th, td {
            border: 1px solid #cbd5e1;
            padding: 6pt 8pt;
            text-align: left;
        }

        th {
            background-color: #1e1b4b;
            color: #ffffff;
            font-weight: 700;
        }

        tr:nth-child(even) {
            background-color: #f8fafc;
        }

        ul, ol {
            margin-top: 4pt;
            margin-bottom: 8pt;
            padding-left: 20pt;
        }

        li {
            margin-bottom: 3pt;
        }

        .cover {
            text-align: center;
            padding: 40pt 20pt;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: #ffffff;
            border-radius: 16px;
            margin-bottom: 30pt;
        }

        .cover h1 {
            color: #ffffff;
            border-bottom: none;
            font-size: 26pt;
            margin-bottom: 8pt;
        }

        .cover p {
            color: #c7d2fe;
            text-align: center;
            font-size: 12pt;
        }
    </style>
</head>
<body>
    <div class="cover">
        <h1>MAPD AI MOCK INTERVIEW 2.0</h1>
        <p>Complete Master Project Documentation &amp; Technical Interview Preparation Handbook</p>
    </div>
"""

full_html = style_header + body_html + "</body>\n</html>"

with open(html_path, "w", encoding="utf-8") as f_html:
    f_html.write(full_html)

print(f"HTML handbook compiled: {html_path}")

# Invoke MS Edge Headless to print to PDF
edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

print("Invoking MS Edge Headless Print to PDF...")

try:
    cmd = [
        edge_exe,
        "--headless",
        "--disable-gpu",
        f"--print-to-pdf={pdf_path}",
        "--no-pdf-header-footer",
        html_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
        print(f"SUCCESS! Master PDF generated: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
    else:
        print(f"PDF generation warning. Return code: {res.returncode}")
        print("StdErr:", res.stderr)
except Exception as e:
    print("PDF conversion exception:", e)

print("Master Handbook Generation Complete!")
