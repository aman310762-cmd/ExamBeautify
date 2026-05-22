// ============================================================
// ExamBeautify — Core Type Definitions & Data Contracts
// All inter-agent communication flows through these types.
// ============================================================

// --- Exam Content Types ---

export type QuestionType = 'MCQ' | 'Short' | 'Long' | 'Numerical' | 'TrueFalse' | 'FillBlank' | 'Diagram';

export interface QuestionContent {
  questionNumber: number;
  type: QuestionType;
  marks: number;
  text: string;
  /** Whether the question contains mathematical notation */
  hasMath: boolean;
  /** LaTeX equation strings extracted from the question */
  latexEquations: string[];
  /** MCQ options (only for type === 'MCQ') */
  options?: string[];
  /** Whether the question references a diagram/figure */
  hasDiagram: boolean;
  /** Semantic text description of any diagram for SVG generation */
  diagramDescription?: string;
  /** Sub-parts of the question (e.g., (a), (b), (c)) */
  subParts?: SubPart[];
  /** Language of the question */
  language?: 'en' | 'hi' | 'bilingual';
  /** Hindi text (for bilingual questions) */
  hindiText?: string;
  /** Section this question belongs to */
  section?: string;
}

export interface SubPart {
  label: string;
  text: string;
  marks: number;
  hasMath: boolean;
  latexEquations: string[];
}

export interface ExamMetadata {
  subject: string;
  totalMarks: number;
  timeAllowed: string;
  className?: string;
  schoolName?: string;
  examTitle?: string;
  date?: string;
  instructions?: string[];
}

export interface ExamDocument {
  examMetadata: ExamMetadata;
  content: QuestionContent[];
}

// --- Style Configuration Types ---

export type ThemeId = 'modern-minimal' | 'classic-exam' | 'corporate-navy' | 'emerald-academic';

export type FontFamily = 'Inter' | 'Roboto' | 'Times New Roman';

export type LayoutMode = 'compact' | 'worksheet';

export interface StyleConfig {
  theme: ThemeId;
  fontFamily: FontFamily;
  fontSize: number;       // in pt (10–14)
  lineHeight: number;     // ratio (1.2–2.0)
  layoutMode: LayoutMode;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    headerBg: string;
    headerText: string;
  };
  preview: string; // CSS gradient for preview card
}

// --- Pipeline & Processing Types ---

export type PipelineStep = 'upload' | 'extract' | 'principal-review' | 'layout' | 'qa' | 'pdf';

export type StepStatus = 'pending' | 'active' | 'complete' | 'error' | 'skipped';

export interface PipelineState {
  currentStep: PipelineStep;
  steps: Record<PipelineStep, StepStatus>;
  extractedData: ExamDocument | null;
  generatedHtml: string | null;
  qaReport: QAReport | null;
  pdfUrl: string | null;
  error: string | null;
}

export interface QAIssue {
  type: 'overlap' | 'clipping' | 'overflow' | 'orphan' | 'broken-svg' | 'spacing' | 'alignment';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  pageNumber?: number;
  elementSelector?: string;
}

export interface QAReport {
  passed: boolean;
  score: number;          // 0–100
  issues: QAIssue[];
  correctionPrompt?: string;
  timestamp: string;
}

// --- Principal Review Agent Types ---

export interface PrincipalReviewIssue {
  questionNumber: number | null;
  field: 'text' | 'marks' | 'options' | 'latex' | 'diagram' | 'section' | 'metadata' | 'missing' | 'extra';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  correction: string;
}

export interface PrincipalReviewReport {
  approved: boolean;
  score: number;           // 0-100 accuracy
  totalIssues: number;
  criticalIssues: number;
  issues: PrincipalReviewIssue[];
  summary: string;
  timestamp: string;
}

export interface PrincipalReviewRequest {
  sourceFileBase64: string;
  sourceMimeType: string;
  extractedData: ExamDocument;
}

export interface PrincipalReviewResponse {
  success: boolean;
  correctedData?: ExamDocument;
  report?: PrincipalReviewReport;
  error?: string;
}

// --- Upload Types ---

export type UploadStatus = 'idle' | 'validating' | 'uploading' | 'complete' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;       // data URL for image files
  status: UploadStatus;
  progress: number;       // 0–100
  error?: string;
}

// --- API Request/Response Types ---

export interface ExtractRequest {
  fileBase64: string;
  fileType: string;
  fileName: string;
}

export interface ExtractResponse {
  success: boolean;
  data?: ExamDocument;
  error?: string;
}

export interface LayoutRequest {
  examData: ExamDocument;
  styleConfig: StyleConfig;
}

export interface LayoutResponse {
  success: boolean;
  html?: string;
  pageCount?: number;
  error?: string;
}

export interface QARequest {
  html: string;
}

export interface QAResponse {
  success: boolean;
  report?: QAReport;
  correctedHtml?: string;
  error?: string;
}

export interface PdfRequest {
  html: string;
}

export interface PipelineRequest {
  fileBase64: string;
  fileType: string;
  fileName: string;
  styleConfig: StyleConfig;
}

export interface PipelineResponse {
  success: boolean;
  pdfUrl?: string;
  examData?: ExamDocument;
  html?: string;
  qaReport?: QAReport;
  error?: string;
}
