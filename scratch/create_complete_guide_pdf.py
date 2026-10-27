# -*- coding: utf-8 -*-
"""
Master Compiler for:
MAPD_Complete_Project_Guide_From_Scratch_to_Deployment.pdf
"""

import os
import sys
import subprocess
import time

workspace_dir = r"c:\Users\Deekshitha P\Documents\AI-Mock-Interview-2.0-main"
html_path = os.path.join(workspace_dir, "MAPD_Complete_Project_Guide_From_Scratch_to_Deployment.html")
pdf_path = os.path.join(workspace_dir, "MAPD_Complete_Project_Guide_From_Scratch_to_Deployment.pdf")
edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

print("Compiling Master Guide HTML...")

# Import parts
sys.path.append(os.path.join(workspace_dir, "scratch"))
from content_part1 import CHAPTER_1_5
from content_part2 import CHAPTER_6_10
from content_part3 import CHAPTER_11_14
from content_part4 import CHAPTER_15_17
from content_part5 import CHAPTER_18_19

HTML_HEADER = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAPD AI Mock Interview — Complete Guide from Scratch to Deployment</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        @page {
            size: A4;
            margin: 18mm 14mm 18mm 14mm;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            line-height: 1.65;
            font-size: 10.5pt;
            margin: 0;
            padding: 0;
        }

        h1, h2, h3, h4, h5 {
            font-family: 'Outfit', 'Inter', sans-serif;
            color: #0f172a;
            font-weight: 800;
            line-height: 1.25;
            page-break-after: avoid;
        }

        h1 {
            font-size: 21pt;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 6px;
            margin-top: 26pt;
            margin-bottom: 12pt;
            color: #1e1b4b;
            page-break-before: always;
        }

        h1:first-of-type {
            page-break-before: avoid;
        }

        h2 {
            font-size: 15pt;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-top: 18pt;
            margin-bottom: 8pt;
            color: #312e81;
        }

        h3 {
            font-size: 12.5pt;
            margin-top: 14pt;
            margin-bottom: 6pt;
            color: #4338ca;
        }

        h4 {
            font-size: 11pt;
            margin-top: 10pt;
            margin-bottom: 4pt;
            color: #475569;
        }

        p {
            margin-top: 4pt;
            margin-bottom: 8pt;
            text-align: justify;
        }

        ul, ol {
            margin-top: 4pt;
            margin-bottom: 8pt;
            padding-left: 20pt;
        }

        li {
            margin-bottom: 3pt;
        }

        code {
            font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
            font-size: 9pt;
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 2px 5px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }

        pre {
            background-color: #0f172a;
            color: #f8fafc;
            padding: 12pt 14pt;
            border-radius: 8pt;
            overflow-x: auto;
            font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
            font-size: 8.5pt;
            line-height: 1.5;
            margin: 10pt 0;
            border: 1px solid #1e293b;
            page-break-inside: avoid;
        }

        pre code {
            background: none;
            color: inherit;
            padding: 0;
            border: none;
            font-size: inherit;
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
            padding: 7pt 9pt;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #1e1b4b;
            color: #ffffff;
            font-weight: 700;
            font-family: 'Outfit', sans-serif;
        }

        tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .cover-page {
            text-align: center;
            padding: 60pt 24pt 40pt 24pt;
            background: linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #312e81 100%);
            color: #ffffff;
            border-radius: 16px;
            margin-bottom: 30pt;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            page-break-after: always;
        }

        .cover-badge {
            display: inline-block;
            background: rgba(99, 102, 241, 0.25);
            border: 1px solid rgba(165, 180, 252, 0.4);
            color: #c7d2fe;
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 10pt;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 18pt;
        }

        .cover-page h1 {
            color: #ffffff;
            border-bottom: none;
            font-size: 28pt;
            margin: 0 0 14pt 0;
            font-family: 'Outfit', sans-serif;
            font-weight: 900;
            letter-spacing: -0.5px;
            page-break-before: avoid;
        }

        .cover-page h2 {
            color: #a5b4fc;
            border-bottom: none;
            font-size: 15pt;
            font-weight: 500;
            margin: 0 0 24pt 0;
        }

        .cover-meta {
            margin-top: 36pt;
            padding-top: 20pt;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12pt;
            text-align: left;
            font-size: 9.5pt;
            color: #cbd5e1;
        }

        .cover-meta div strong {
            color: #ffffff;
        }

        .callout {
            padding: 10pt 14pt;
            margin: 10pt 0;
            border-radius: 8px;
            border-left: 4px solid #6366f1;
            background-color: #f5f7ff;
            page-break-inside: avoid;
        }

        .callout-viva {
            border-left-color: #10b981;
            background-color: #f0fdf4;
        }

        .callout-warning {
            border-left-color: #f59e0b;
            background-color: #fffbeb;
        }

        .callout-danger {
            border-left-color: #ef4444;
            background-color: #fef2f2;
        }

        .callout-title {
            font-weight: 700;
            font-family: 'Outfit', sans-serif;
            margin-bottom: 4pt;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .callout-viva .callout-title { color: #065f46; }
        .callout-warning .callout-title { color: #92400e; }
        .callout-danger .callout-title { color: #991b1b; }
        .callout .callout-title { color: #3730a3; }

        .toc {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16pt 20pt;
            margin: 20pt 0 30pt 0;
            page-break-after: always;
        }

        .toc h2 {
            margin-top: 0;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 6px;
            color: #1e1b4b;
        }

        .toc-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6pt 16pt;
            font-size: 9pt;
        }

        .toc-item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dotted #cbd5e1;
            padding: 3pt 0;
        }

        .toc-item a {
            color: #334155;
            text-decoration: none;
            font-weight: 500;
        }

        .toc-item a:hover {
            color: #4f46e5;
            text-decoration: underline;
        }

        .toc-item span {
            color: #6366f1;
            font-weight: 700;
        }

        .viva-box {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10pt 12pt;
            margin-bottom: 10pt;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            page-break-inside: avoid;
        }

        .viva-q {
            font-weight: 700;
            color: #1e1b4b;
            font-size: 10pt;
            margin-bottom: 4pt;
        }

        .viva-a {
            color: #334155;
            font-size: 9.5pt;
            margin-bottom: 4pt;
        }

        .viva-spoken {
            background: #f0fdf4;
            border-left: 3px solid #10b981;
            padding: 4pt 8pt;
            font-size: 9pt;
            color: #166534;
            font-style: italic;
        }
    </style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
    <div class="cover-badge">College Viva &amp; Engineering Mastery Guide</div>
    <h1>MAPD AI MOCK INTERVIEW 2.0</h1>
    <h2>Complete Project Guide from Scratch to Deployment</h2>
    <p style="text-align: center; color: #c7d2fe; max-width: 650px; margin: 0 auto; font-size: 11pt;">
        An in-depth, beginner-friendly technical guide explaining the complete architecture, source code, reactive database, multimodal vision/speech telemetry, AI models, and deployment workflows.
    </p>
    
    <div class="cover-meta">
        <div><strong>Project Name:</strong> AI Mock Interview 2.0 (MAPD)</div>
        <div><strong>Framework:</strong> Next.js 15.4 (App Router) + React 19</div>
        <div><strong>Database:</strong> Convex Serverless Reactive Document DB</div>
        <div><strong>Authentication:</strong> Clerk Managed Auth with JWT Middleware</div>
        <div><strong>AI Engine:</strong> Google Gemini 1.5 Flash + Rule Engine</div>
        <div><strong>Media &amp; Vision:</strong> Canvas 2D + Web Speech + Multi-Tier Storage</div>
        <div><strong>Author / Student:</strong> Software Engineering Viva Candidate</div>
        <div><strong>Document Status:</strong> Complete Master Guide (Chapters 1–19)</div>
    </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="toc">
    <h2>TABLE OF CONTENTS</h2>
    <div class="toc-grid">
        <div class="toc-item"><a href="#ch1">1. Project Introduction &amp; Problem Statement</a> <span>CH 1</span></div>
        <div class="toc-item"><a href="#ch2">2. Complete Technology Stack Reference</a> <span>CH 2</span></div>
        <div class="toc-item"><a href="#ch3">3. Building the Project from Scratch</a> <span>CH 3</span></div>
        <div class="toc-item"><a href="#ch4">4. Complete Folder &amp; File Structure</a> <span>CH 4</span></div>
        <div class="toc-item"><a href="#ch5">5. Frontend Architecture from Basics</a> <span>CH 5</span></div>
        <div class="toc-item"><a href="#ch6">6. Backend &amp; Serverless Business Logic</a> <span>CH 6</span></div>
        <div class="toc-item"><a href="#ch7">7. Database Deep Dive (Convex Schema)</a> <span>CH 7</span></div>
        <div class="toc-item"><a href="#ch8">8. Complete REST API Documentation</a> <span>CH 8</span></div>
        <div class="toc-item"><a href="#ch9">9. API Keys &amp; Environment Variables</a> <span>CH 9</span></div>
        <div class="toc-item"><a href="#ch10">10. Authentication &amp; System Security</a> <span>CH 10</span></div>
        <div class="toc-item"><a href="#ch11">11. Artificial Intelligence Integration</a> <span>CH 11</span></div>
        <div class="toc-item"><a href="#ch12">12. Recording, Camera, Mic &amp; Vision Telemetry</a> <span>CH 12</span></div>
        <div class="toc-item"><a href="#ch13">13. Complete End-to-End Execution Trace</a> <span>CH 13</span></div>
        <div class="toc-item"><a href="#ch14">14. Running Locally on Windows (Step-by-Step)</a> <span>CH 14</span></div>
        <div class="toc-item"><a href="#ch15">15. Production Deployment from Scratch</a> <span>CH 15</span></div>
        <div class="toc-item"><a href="#ch16">16. Testing, Debugging &amp; Troubleshooting</a> <span>CH 16</span></div>
        <div class="toc-item"><a href="#ch17">17. Important Source Code Explanations</a> <span>CH 17</span></div>
        <div class="toc-item"><a href="#ch18">18. Viva &amp; Interview Preparation (100+ Q&amp;A)</a> <span>CH 18</span></div>
        <div class="toc-item"><a href="#ch19">19. Final Revision &amp; Quick Reference Cheat Sheet</a> <span>CH 19</span></div>
    </div>
</div>
"""

full_html = (
    HTML_HEADER +
    CHAPTER_1_5 +
    CHAPTER_6_10 +
    CHAPTER_11_14 +
    CHAPTER_15_17 +
    CHAPTER_18_19
)

with open(html_path, "w", encoding="utf-8") as f_out:
    f_out.write(full_html)

print(f"Master HTML written successfully to: {html_path}")
print(f"HTML File Size: {os.path.getsize(html_path):,} bytes")

# Invoke MS Edge Headless to print to PDF
print("Invoking Microsoft Edge Headless Print to PDF...")
cmd = [
    edge_exe,
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_path}",
    "--no-pdf-header-footer",
    html_path
]

try:
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
        print(f"SUCCESS! Master PDF Generated: {pdf_path}")
        print(f"PDF File Size: {os.path.getsize(pdf_path):,} bytes ({os.path.getsize(pdf_path) / (1024*1024):.2f} MB)")
    else:
        print("Warning: PDF file was not created or has 0 bytes.")
except subprocess.CalledProcessError as e:
    print(f"Error executing Edge: {e}")
    print(f"Stderr: {e.stderr}")
