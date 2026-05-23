// ============================================================
// ExamBeautify — Gemini AI Client
// ============================================================

import { GoogleGenAI } from '@google/genai';

let genaiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] No API key found. Set GEMINI_API_KEY in .env.local');
    return null;
  }
  if (!genaiInstance) {
    genaiInstance = new GoogleGenAI({ apiKey });
  }
  return genaiInstance;
}

export const MODELS = {
  EXTRACTION: 'gemini-2.5-flash',
  LAYOUT: 'gemini-2.5-flash',
  QA: 'gemini-2.5-flash',
  PRINCIPAL: 'gemini-2.5-flash',
} as const;

/**
 * Extract exam content from file data using Gemini.
 * Supports images (jpg/png) and PDFs.
 */
export async function extractContentFromFile(
  fileBase64: string,
  mimeType: string
): Promise<string> {
  const client = getGeminiClient();
  if (!client) throw new Error('Gemini API key not configured');

  // For PDFs, send the PDF directly — Gemini 2.5 supports PDF input natively
  const effectiveMimeType = mimeType === 'application/pdf' ? 'application/pdf' : mimeType;

  const response = await client.models.generateContent({
    model: MODELS.EXTRACTION,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: effectiveMimeType,
              data: fileBase64,
            },
          },
          {
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  return response.text || '';
}

/**
 * Perform visual QA on a rendered page screenshot
 */
export async function auditLayoutVisual(
  screenshotBase64: string
): Promise<string> {
  const client = getGeminiClient();
  if (!client) throw new Error('Gemini API key not configured');

  const response = await client.models.generateContent({
    model: MODELS.QA,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: screenshotBase64,
            },
          },
          {
            text: QA_PROMPT,
          },
        ],
      },
    ],
  });

  return response.text || '';
}

/**
 * Principal Review: Cross-verify extracted data against the original source.
 * Sends both the original file and the extracted JSON to Gemini.
 */
export async function principalReviewExtraction(
  sourceFileBase64: string,
  sourceMimeType: string,
  extractedDataJson: string
): Promise<string> {
  const client = getGeminiClient();
  if (!client) throw new Error('Gemini API key not configured');

  const effectiveMimeType = sourceMimeType === 'application/pdf' ? 'application/pdf' : sourceMimeType;

  const response = await client.models.generateContent({
    model: MODELS.PRINCIPAL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: effectiveMimeType,
              data: sourceFileBase64,
            },
          },
          {
            text: PRINCIPAL_REVIEW_PROMPT.replace('{{EXTRACTED_DATA}}', extractedDataJson),
          },
        ],
      },
    ],
  });

  return response.text || '';
}

/**
 * Parse JSON from Gemini response, handling markdown fences and other artifacts.
 */
export function parseJsonFromResponse(text: string): string {
  // Try to extract from markdown fences first
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Try to find raw JSON object
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0].trim();
  }

  return text.trim();
}

// --- System Prompts ---

const EXTRACTION_PROMPT = `You are an expert exam paper OCR specialist. Analyze this exam paper document and extract ALL content into a structured JSON format.

CRITICAL RULES:
1. Extract EVERY question exactly as written — do not fix grammar, spelling, or formatting.
2. For mathematical expressions, convert them into standard LaTeX notation. Use proper LaTeX commands (e.g., \\frac{}{}, \\sqrt{}, \\int, \\sum, \\times, \\div, \\leq, \\geq, \\alpha, \\beta, \\theta, \\pi).
3. For Hindi/Devanagari text, preserve it exactly. Set language to "bilingual" if both Hindi and English are present.
4. DIAGRAMS — VERY IMPORTANT:
   - Set hasDiagram to true ONLY for scientific/geometric/technical diagrams (circuits, triangles, graphs, lens diagrams, ray diagrams, geometric constructions, chemical structures).
   - DO NOT set hasDiagram for photos, pictures, illustrations, cartoons, story panels, classroom scenes, or decorative images. For these, describe them in the question text itself (e.g., "[Picture: cartoon of rabbit and tortoise race]").
   - For real diagrams, write a PRECISE scientific description in diagramDescription (e.g., "A right triangle ABC with angle B = 90°, AB = 3cm, BC = 4cm").
5. Identify question types: MCQ, Short, Long, Numerical, TrueFalse, FillBlank, Diagram.
6. Extract section headers, instructions, and metadata (subject, total marks, time, class, school name).
7. Process ALL pages of the document — do not skip any content.
8. For MCQ questions, extract ALL options into the "options" array.
9. If questions have sub-parts like (a), (b), (c) or (i), (ii), (iii), put them in "subParts" array.
10. QUESTION NUMBERING — VERY IMPORTANT:
    - Use the ORIGINAL question number as printed in the paper. Do NOT create your own sequential numbering.
    - If a section has questions numbered 1-10, use those numbers (1, 2, 3...), NOT a global counter (41, 42, 43...).
    - If the paper uses "Creative Writing -1", "Creative Writing -2", use those original numbers (1, 2, 3...).
11. SECTIONS — Use the EXACT section name from the paper (e.g., "COMPETENCY 3- CREATIVE WRITING", "Section A", "Reading Comprehension", "Grammar"). Do NOT shorten to just "A", "B", "C" unless that's what the paper actually says.

OUTPUT FORMAT (strict JSON, no markdown fences):
{
  "examMetadata": {
    "subject": "string",
    "totalMarks": number,
    "timeAllowed": "string",
    "className": "string or null",
    "schoolName": "string or null",
    "examTitle": "string or null",
    "date": "string or null",
    "instructions": ["string array"]
  },
  "content": [
    {
      "questionNumber": number,
      "type": "MCQ|Short|Long|Numerical|TrueFalse|FillBlank|Diagram",
      "marks": number,
      "text": "raw question text in English",
      "hasMath": true/false,
      "latexEquations": ["LaTeX strings found in the question"],
      "options": ["option strings - for MCQ only"],
      "hasDiagram": true/false,
      "diagramDescription": "detailed SCIENTIFIC description if hasDiagram is true, else null",
      "section": "EXACT section name from the paper",
      "language": "en or hi or bilingual",
      "hindiText": "Hindi version if bilingual, else null",
      "subParts": [{"label": "(a)", "text": "sub part text", "marks": 1, "hasMath": false, "latexEquations": []}]
    }
  ]
}

Return ONLY valid JSON. No markdown fences, no explanation, no comments.`;

const QA_PROMPT = `You are a visual quality assurance expert for printed exam papers. Analyze this screenshot of a rendered exam paper and evaluate it against these criteria:

GRADING MATRIX (score each 0-100):
1. TEXT OVERLAP: Are any text layers overlapping or colliding?
2. LATEX RENDERING: Are all mathematical equations properly rendered without clipping?
3. PAGE FLOW: Is content flowing naturally without awkward breaks?
4. ALIGNMENT: Are all elements properly aligned?
5. DIAGRAMS: Are SVG diagrams rendering correctly?
6. SPACING: Is spacing consistent and appropriate?
7. READABILITY: Is the overall document readable and print-ready?

OUTPUT FORMAT (strict JSON, no markdown fences):
{
  "passed": boolean,
  "score": number,
  "issues": [
    {
      "type": "overlap|clipping|overflow|orphan|broken-svg|spacing|alignment",
      "severity": "critical|warning|info",
      "description": "detailed description of the issue",
      "pageNumber": number
    }
  ],
  "correctionPrompt": "If failed, describe what CSS/HTML changes to make."
}

Return ONLY valid JSON.`;

const PRINCIPAL_REVIEW_PROMPT = `You are a SCHOOL PRINCIPAL performing a FINAL QUALITY CHECK on an exam paper extraction. You have been given:
1. The ORIGINAL exam paper (attached file/image)
2. The EXTRACTED DATA (JSON below)

Your job is to carefully compare EVERY detail and find ALL errors, then provide a CORRECTED version of the data.

EXTRACTED DATA TO REVIEW:
\`\`\`json
{{EXTRACTED_DATA}}
\`\`\`

CHECK EACH OF THESE CAREFULLY:

1. **QUESTION COUNT**: Are ALL questions from the original paper extracted? Are there any missing or extra questions?
2. **QUESTION TEXT**: Is the text of each question accurate and complete? Check word-by-word.
3. **MARKS**: Are marks for each question correct as shown in the original?
4. **SECTIONS**: Are questions assigned to the correct sections (A, B, C, D)?
5. **MCQ OPTIONS**: For MCQ questions, are ALL options present and correct?
6. **MATH/LATEX**: Are mathematical expressions correctly converted to LaTeX? Check every fraction, integral, matrix, vector, etc.
7. **DIAGRAMS**: For questions with diagrams, is hasDiagram set to true? Is the diagramDescription accurate to what's shown?
8. **SUB-PARTS**: Are all sub-parts (a), (b), (c), (i), (ii), (iii) captured?
9. **METADATA**: Is subject, totalMarks, timeAllowed, className, schoolName, examTitle correct?
10. **INSTRUCTIONS**: Are all general instructions captured?
11. **BILINGUAL**: If there's Hindi text, is it captured in hindiText field?
12. **QUESTION TYPES**: MCQ, Short, Long — are they correctly classified based on the original paper?

OUTPUT FORMAT (strict JSON, no markdown fences):
{
  "approved": boolean,
  "score": number (0-100, where 100 = perfect extraction),
  "totalIssues": number,
  "criticalIssues": number,
  "summary": "One paragraph summary of findings",
  "issues": [
    {
      "questionNumber": number or null (null for metadata issues),
      "field": "text|marks|options|latex|diagram|section|metadata|missing|extra",
      "severity": "critical|warning|info",
      "description": "What is wrong",
      "correction": "What the correct value should be"
    }
  ],
  "correctedData": { ... the FULL corrected ExamDocument JSON with all fixes applied ... }
}

RULES:
- If the extraction is perfect, set approved=true, score=100, issues=[]
- If there are only minor issues (info/warning), still set approved=true but include fixes in correctedData
- If there are critical issues (missing questions, wrong marks, wrong math), set approved=false
- ALWAYS provide correctedData with ALL fixes applied, even for minor issues
- The correctedData must be a complete valid ExamDocument (same schema as input)
- Be STRICT — a school principal would not accept any errors

Return ONLY valid JSON. No markdown fences, no explanation.`;
