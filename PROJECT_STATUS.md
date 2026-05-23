# ExamBeautify — Project Status Report

> **Last Updated:** 23 May 2026  
> **Version:** 1.0.0-beta  
> **Status:** 🟡 In Development — Rendering Issues Under Resolution  
> **Live URL:** [exam-beautify.vercel.app](https://exam-beautify.vercel.app)  
> **GitHub:** [github.com/aman310762-cmd/ExamBeautify](https://github.com/aman310762-cmd/ExamBeautify)

---

## 1. What is ExamBeautify?

ExamBeautify is an AI-powered web platform that transforms **messy, unstructured school exam papers** (scanned images or PDFs) into **stunning, print-ready A4 PDF documents**.

**Target Users:** School teachers and administrators who create exam papers manually and want professional-looking, beautifully formatted question papers.

**Supported Subjects:** Mathematics, Physics, Chemistry, English, Hindi (bilingual)

### Before → After

| Input (Raw) | Output (Beautified) |
|---|---|
| Handwritten/typed messy exam papers | Clean, styled, print-ready A4 PDFs |
| Blurry scans, uneven formatting | Professional layouts with themes |
| Math written as text (x^2 + 2x) | Rendered LaTeX equations (x² + 2x) |
| No diagrams | Auto-generated SVG diagrams |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes (serverless functions) |
| **AI Engine** | Google Gemini 2.5 Flash (extraction + review) |
| **PDF Engine** | Puppeteer (local) / @sparticuz/chromium (Vercel) |
| **Math Rendering** | KaTeX (server-side LaTeX → HTML) |
| **Diagrams** | Custom SVG generators (triangles, circuits, graphs, optics) |
| **State Management** | Zustand |
| **Icons** | Lucide React |
| **Deployment** | Vercel (Hobby plan) |

---

## 3. Architecture — Multi-Agent Pipeline

The system uses a **6-step autonomous agent pipeline**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER UPLOADS EXAM PAPER                      │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────┐
│  STEP 1: UPLOAD         │  Validates file (PDF/Image, max 10MB)
│  Agent A                │  Converts to base64 for API
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  STEP 2: EXTRACT        │  Sends file to Gemini 2.5 Flash
│  Agent B (Gemini AI)    │  Returns structured JSON:
│                         │  - Questions, marks, sections
│                         │  - LaTeX math equations
│                         │  - Diagram descriptions
│                         │  - Hindi/bilingual text
│                         │  - MCQ options, sub-parts
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  STEP 3: PRINCIPAL      │  Sends BOTH original file + extracted
│  REVIEW (Agent E)       │  JSON back to Gemini for comparison.
│  🎓 "School Principal"  │  Catches: missing questions, wrong
│                         │  marks, incorrect math, bad diagrams.
│                         │  Auto-corrects the data.
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  STEP 4: LAYOUT         │  Applies selected theme & typography
│  Agent C                │  Renders: KaTeX math, SVG diagrams,
│                         │  bilingual text, MCQ grids
│                         │  Outputs: Full HTML document
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  STEP 5: QA             │  Takes screenshot of rendered HTML
│  Agent D (Visual Audit) │  Sends to Gemini for visual check:
│                         │  overlap, clipping, spacing, alignment
│                         │  Returns score (0-100) + issues
└─────────────┬───────────┘
              ▼
┌─────────────────────────┐
│  STEP 6: PDF            │  Puppeteer renders HTML → PDF
│  Generation             │  A4 format, multi-page, print-ready
│                         │  User downloads the final file
└─────────────────────────┘
```

---

## 4. File Structure

```
exam-beautify/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main page (pipeline orchestrator)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles + dark theme
│   │   └── api/
│   │       ├── process/
│   │       │   ├── extract/route.ts    # Agent B — Gemini OCR extraction
│   │       │   ├── principal-review/route.ts  # Agent E — Cross-verification
│   │       │   ├── layout/route.ts     # Agent C — HTML generation
│   │       │   └── qa/route.ts         # Agent D — Visual QA audit
│   │       ├── generate-pdf/route.ts   # Puppeteer PDF generation
│   │       └── pipeline/route.ts       # Full pipeline (single endpoint)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Top banner + logo
│   │   │   └── Footer.tsx              # Footer
│   │   ├── upload/
│   │   │   └── UploadZone.tsx          # Drag-drop file upload
│   │   ├── controls/
│   │   │   ├── ThemeSelector.tsx       # 4 theme cards
│   │   │   ├── TypographyPanel.tsx     # Font, size, line-height
│   │   │   └── LayoutToggle.tsx        # Compact vs worksheet mode
│   │   ├── preview/
│   │   │   └── PreviewCanvas.tsx       # Live HTML preview + download
│   │   └── pipeline/
│   │       └── PipelineStatus.tsx      # 6-step pipeline progress UI
│   │
│   ├── lib/
│   │   ├── gemini.ts                   # Gemini API client + all prompts
│   │   ├── puppeteer.ts               # Browser launcher (local + Vercel)
│   │   ├── katex-renderer.ts          # LaTeX → HTML rendering
│   │   ├── svg-generator.ts           # Diagram SVG generators
│   │   └── templates/
│   │       ├── base.ts                # Base HTML template (CSS, fonts)
│   │       ├── exam-renderer.ts       # Question → HTML converter
│   │       └── themes.ts             # 4 theme color definitions
│   │
│   ├── store/
│   │   └── useAppStore.ts             # Zustand global state
│   │
│   ├── types/
│   │   └── exam.ts                    # All TypeScript interfaces
│   │
│   └── data/
│       └── mockExam.ts                # Mock data (when no file uploaded)
│
├── next.config.ts                      # Puppeteer + serverless config
├── package.json
├── tailwind.config.ts
└── .env.local                          # GEMINI_API_KEY (not in git)
```

---

## 5. Available Themes

| Theme | Style |
|---|---|
| **Modern Minimal** | Clean white, indigo accents, Inter font |
| **Classic Exam** | Traditional sepia tones, serif fonts |
| **Corporate Navy** | Dark navy headers, professional look |
| **Emerald Academic** | Green tones, academic feel |

---

## 6. Current Status

### ✅ What's Working
- File upload (PDF + images)
- Gemini AI extraction (questions, math, diagrams, bilingual)
- Principal Review Agent (cross-verification)
- 4 theme options with live preview
- Typography controls (font, size, line-height)
- KaTeX math rendering (fractions, integrals, matrices)
- SVG diagram generation (basic shapes)
- Multi-page A4 PDF generation via Puppeteer
- Pipeline status UI with progress tracking
- Vercel deployment with serverless Puppeteer
- Git repository on GitHub

### 🟡 Known Rendering Issues (NEED FIXING)

> [!WARNING]
> The following rendering issues have been observed in generated PDFs and are the primary items requiring resolution before production release.

#### Issue 1: Math Formulas Not Rendering Correctly
- **Problem:** Some LaTeX expressions appear as raw text instead of rendered math
- **Where:** Complex nested expressions like `\frac{\partial}{\partial x}`, matrices, multi-line equations
- **Root Cause:** KaTeX inline CSS may not cover all edge cases; CDN font loading can fail in Puppeteer
- **Impact:** 🔴 Critical — math-heavy papers (Maths, Physics) look broken

#### Issue 2: Diagrams Not Matching Original Content
- **Problem:** SVG diagrams are generic (e.g., shows a basic triangle when question asks for a specific geometric construction)
- **Where:** Physics circuits, geometry constructions, graph plots, optics diagrams
- **Root Cause:** SVG generator uses keyword matching on `diagramDescription` — often falls back to a placeholder
- **Impact:** 🔴 Critical — diagrams are a key differentiator

#### Issue 3: Content Accuracy After Extraction
- **Problem:** Gemini sometimes misses questions, merges sub-parts, or gets marks wrong
- **Where:** Dense papers with 30+ questions, papers with unusual formatting
- **Root Cause:** Single-pass extraction; Gemini's OCR is probabilistic
- **Impact:** 🟡 Medium — Principal Review Agent catches some errors but not all

#### Issue 4: Page Break Issues
- **Problem:** Questions occasionally split awkwardly across pages (question header on one page, options on next)
- **Where:** Long questions with diagrams + options near page boundaries
- **Root Cause:** CSS `break-inside: avoid` doesn't always work with Puppeteer's page-breaking algorithm
- **Impact:** 🟡 Medium — affects print quality

#### Issue 5: Hindi/Bilingual Text Formatting
- **Problem:** Hindi text sometimes renders with incorrect spacing or overlaps English text
- **Where:** Bilingual papers (CBSE/State board Hindi-medium)
- **Root Cause:** Noto Sans Devanagari font loading + CSS margin calculations for bilingual blocks
- **Impact:** 🟡 Medium — affects Hindi-medium schools

#### Issue 6: Vercel Deployment Timeout
- **Problem:** Gemini API calls take 30-70 seconds; Vercel Hobby plan has 60s function limit
- **Where:** extraction + principal review steps on deployed version
- **Root Cause:** Free tier limits on both Gemini (20 requests/day) and Vercel (60s timeout)
- **Impact:** 🟡 Medium — works locally, partially broken on Vercel free tier

---

## 7. API Keys & Environment

| Variable | Description | Where to Get |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini 2.5 Flash API key | [ai.google.dev](https://ai.google.dev) |

**Local:** Stored in `.env.local` (not committed to git)  
**Vercel:** Added in Project Settings → Environment Variables

**Free Tier Limits:**
- Gemini: 20 requests/day (resets daily)
- Vercel: 60s function timeout (Pro = 300s)

---

## 8. How to Run Locally

```bash
# Clone
git clone https://github.com/aman310762-cmd/ExamBeautify.git
cd ExamBeautify

# Install dependencies
npm install

# Set up API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 9. Next Steps (Priority Order)

1. **🔴 Fix math rendering** — Ensure all LaTeX renders correctly in PDFs (expand KaTeX CSS coverage, add MathJax fallback)
2. **🔴 Improve diagram generation** — Use Gemini to generate more accurate SVG based on diagram descriptions, or integrate a proper diagram library
3. **🟡 Fix page breaks** — Add smarter page-break logic that keeps question blocks together
4. **🟡 Improve extraction accuracy** — Add retry logic with different prompts when extraction quality is low
5. **🟡 Hindi text polish** — Test with more bilingual papers, fix font loading
6. **🟢 Vercel Pro upgrade** — Needed for production deployment (300s timeout)
7. **🟢 UI enhancements** — Add more themes, before/after comparison view, batch processing

---

## 10. Testing

**Test file:** `5-maths.pdf` (4 pages, 202KB, 30 questions with math + diagrams)

```bash
# Run locally and upload the test file through the UI
npm run dev
# Open http://localhost:3000
# Upload 5-maths.pdf → Select theme → Click "Generate Beautiful Exam Paper"
# Download and compare with original
```

---

*This document should be updated as rendering issues are resolved and new features are added.*
