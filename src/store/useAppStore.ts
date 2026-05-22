// ============================================================
// ExamBeautify — Zustand Global State Store
// ============================================================

import { create } from 'zustand';
import {
  UploadedFile,
  StyleConfig,
  PipelineStep,
  StepStatus,
  ExamDocument,
  QAReport,
  PrincipalReviewReport,
  ThemeId,
  FontFamily,
  LayoutMode,
} from '@/types/exam';

interface AppState {
  // --- Upload State ---
  files: UploadedFile[];
  addFile: (file: UploadedFile) => void;
  removeFile: (id: string) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: UploadedFile['status'], error?: string) => void;
  clearFiles: () => void;

  // --- Style Config ---
  styleConfig: StyleConfig;
  setTheme: (theme: ThemeId) => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setLayoutMode: (mode: LayoutMode) => void;

  // --- Pipeline State ---
  currentStep: PipelineStep;
  stepStatuses: Record<PipelineStep, StepStatus>;
  extractedData: ExamDocument | null;
  generatedHtml: string | null;
  qaReport: QAReport | null;
  principalReport: PrincipalReviewReport | null;
  pdfUrl: string | null;
  pipelineError: string | null;
  isProcessing: boolean;

  setCurrentStep: (step: PipelineStep) => void;
  setStepStatus: (step: PipelineStep, status: StepStatus) => void;
  setExtractedData: (data: ExamDocument) => void;
  setGeneratedHtml: (html: string) => void;
  setQAReport: (report: QAReport) => void;
  setPrincipalReport: (report: PrincipalReviewReport) => void;
  setPdfUrl: (url: string) => void;
  setPipelineError: (error: string) => void;
  setIsProcessing: (processing: boolean) => void;
  resetPipeline: () => void;

  // --- Preview State ---
  currentPage: number;
  totalPages: number;
  zoom: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setZoom: (zoom: number) => void;
}

const initialStepStatuses: Record<PipelineStep, StepStatus> = {
  upload: 'pending',
  extract: 'pending',
  'principal-review': 'pending',
  layout: 'pending',
  qa: 'pending',
  pdf: 'pending',
};

export const useAppStore = create<AppState>((set) => ({
  // --- Upload State ---
  files: [],
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (id) => set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
  updateFileProgress: (id, progress) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, progress } : f)),
    })),
  updateFileStatus: (id, status, error) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, status, error } : f)),
    })),
  clearFiles: () => set({ files: [] }),

  // --- Style Config ---
  styleConfig: {
    theme: 'modern-minimal',
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 1.5,
    layoutMode: 'worksheet',
  },
  setTheme: (theme) =>
    set((state) => ({ styleConfig: { ...state.styleConfig, theme } })),
  setFontFamily: (fontFamily) =>
    set((state) => ({ styleConfig: { ...state.styleConfig, fontFamily } })),
  setFontSize: (fontSize) =>
    set((state) => ({ styleConfig: { ...state.styleConfig, fontSize } })),
  setLineHeight: (lineHeight) =>
    set((state) => ({ styleConfig: { ...state.styleConfig, lineHeight } })),
  setLayoutMode: (layoutMode) =>
    set((state) => ({ styleConfig: { ...state.styleConfig, layoutMode } })),

  // --- Pipeline State ---
  currentStep: 'upload',
  stepStatuses: { ...initialStepStatuses },
  extractedData: null,
  generatedHtml: null,
  qaReport: null,
  principalReport: null,
  pdfUrl: null,
  pipelineError: null,
  isProcessing: false,

  setCurrentStep: (step) => set({ currentStep: step }),
  setStepStatus: (step, status) =>
    set((state) => ({
      stepStatuses: { ...state.stepStatuses, [step]: status },
    })),
  setExtractedData: (data) => set({ extractedData: data }),
  setGeneratedHtml: (html) => set({ generatedHtml: html }),
  setQAReport: (report) => set({ qaReport: report }),
  setPrincipalReport: (report) => set({ principalReport: report }),
  setPdfUrl: (url) => set({ pdfUrl: url }),
  setPipelineError: (error) => set({ pipelineError: error }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  resetPipeline: () =>
    set({
      currentStep: 'upload',
      stepStatuses: { ...initialStepStatuses },
      extractedData: null,
      generatedHtml: null,
      qaReport: null,
      principalReport: null,
      pdfUrl: null,
      pipelineError: null,
      isProcessing: false,
    }),

  // --- Preview State ---
  currentPage: 1,
  totalPages: 1,
  zoom: 100,
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setZoom: (zoom) => set({ zoom: Math.min(150, Math.max(50, zoom)) }),
}));
