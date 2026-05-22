'use client';

import React, { useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UploadZone } from '@/components/upload/UploadZone';
import { ThemeSelector } from '@/components/controls/ThemeSelector';
import { TypographyPanel } from '@/components/controls/TypographyPanel';
import { LayoutToggle } from '@/components/controls/LayoutToggle';
import { PreviewCanvas } from '@/components/preview/PreviewCanvas';
import { PipelineStatus } from '@/components/pipeline/PipelineStatus';
import { useAppStore } from '@/store/useAppStore';
import {
  Wand2,
  Sparkles,
  ArrowRight,
  Layers,
  BookOpen,
  Zap,
} from 'lucide-react';

export default function Home() {
  const {
    files,
    styleConfig,
    isProcessing,
    setIsProcessing,
    setCurrentStep,
    setStepStatus,
    setExtractedData,
    setGeneratedHtml,
    setQAReport,
    setPrincipalReport,
    setPipelineError,
    resetPipeline,
  } = useAppStore();

  const runPipeline = useCallback(async () => {
    setIsProcessing(true);
    resetPipeline();

    try {
      // Step 1: Upload
      setCurrentStep('upload');
      setStepStatus('upload', 'active');

      let fileBase64 = '';
      let fileType = '';
      let fileName = '';

      if (files.length > 0 && files[0].file) {
        // Convert file to base64 using FileReader (handles large files)
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            // Strip the "data:...;base64," prefix to get raw base64
            const base64 = dataUrl.split(',')[1] || '';
            resolve(base64);
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(files[0].file);
        });
        fileType = files[0].type;
        fileName = files[0].name;
      }

      setStepStatus('upload', 'complete');

      // Step 2: Extract
      setCurrentStep('extract');
      setStepStatus('extract', 'active');

      const extractRes = await fetch('/api/process/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, fileType, fileName }),
      });

      const extractData = await extractRes.json();
      if (!extractData.success) throw new Error(extractData.error);

      setExtractedData(extractData.data);
      setStepStatus('extract', 'complete');

      // Step 3: Principal Review — cross-verify extraction against source
      setCurrentStep('principal-review');
      setStepStatus('principal-review', 'active');

      let finalExamData = extractData.data;

      try {
        const principalRes = await fetch('/api/process/principal-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceFileBase64: fileBase64,
            sourceMimeType: fileType,
            extractedData: extractData.data,
          }),
        });

        const principalData = await principalRes.json();
        if (principalData.success) {
          if (principalData.report) {
            setPrincipalReport(principalData.report);
          }
          if (principalData.correctedData) {
            finalExamData = principalData.correctedData;
            setExtractedData(finalExamData); // Update with corrected data
          }
        }
      } catch (principalError) {
        console.warn('[Pipeline] Principal review failed, using original:', principalError);
      }

      setStepStatus('principal-review', 'complete');

      // Step 4: Layout
      setCurrentStep('layout');
      setStepStatus('layout', 'active');

      const layoutRes = await fetch('/api/process/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examData: finalExamData,
          styleConfig,
        }),
      });

      const layoutData = await layoutRes.json();
      if (!layoutData.success) throw new Error(layoutData.error);

      setGeneratedHtml(layoutData.html);
      setStepStatus('layout', 'complete');

      // Step 5: QA
      setCurrentStep('qa');
      setStepStatus('qa', 'active');

      const qaRes = await fetch('/api/process/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: layoutData.html }),
      });

      const qaData = await qaRes.json();
      if (qaData.success && qaData.report) {
        setQAReport(qaData.report);
      }
      setStepStatus('qa', 'complete');

      // Step 6: PDF Ready
      setCurrentStep('pdf');
      setStepStatus('pdf', 'active');

      // Mark PDF as ready (actual generation happens on download)
      setStepStatus('pdf', 'complete');

    } catch (error) {
      console.error('[Pipeline] Error:', error);
      setPipelineError(error instanceof Error ? error.message : 'Pipeline failed');
    } finally {
      setIsProcessing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, styleConfig]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Hero section */}
        <section className="relative px-6 py-10 border-b border-white/[0.04]">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-transparent pointer-events-none" />
          <div className="max-w-[1600px] mx-auto relative">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium mb-4">
                <Zap className="w-3 h-3" />
                AI-Powered Exam Paper Transformation
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                Upload messy papers,<br />
                <span className="gradient-text-glow">get stunning PDFs</span>
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Our multi-agent AI pipeline extracts content from any exam paper image,
                applies beautiful themes, and generates pixel-perfect print-ready A4 documents.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex items-center justify-center gap-6 mt-6">
              {[
                { icon: <BookOpen className="w-3.5 h-3.5" />, text: 'Math, Physics, Chemistry' },
                { icon: <Layers className="w-3.5 h-3.5" />, text: 'Hindi + English Bilingual' },
                { icon: <Sparkles className="w-3.5 h-3.5" />, text: 'LaTeX & SVG Diagrams' },
              ].map((pill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-slate-400"
                >
                  <span className="text-indigo-400">{pill.icon}</span>
                  {pill.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Split Layout */}
        <section className="flex-1 flex split-layout max-w-[1600px] w-full mx-auto">
          {/* LEFT PANEL — Controls */}
          <div className="split-panel w-[420px] shrink-0 border-r border-white/[0.04] overflow-y-auto">
            <div className="p-5 space-y-6 stagger-children">
              {/* Upload */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Step 1 — Upload Exam Paper
                </h3>
                <UploadZone />
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

              {/* Style Controls */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Step 2 — Customize Style
                </h3>
                <div className="space-y-5">
                  <ThemeSelector />
                  <TypographyPanel />
                  <LayoutToggle />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

              {/* Generate Button */}
              <div>
                <button
                  onClick={runPipeline}
                  disabled={isProcessing}
                  className="btn-primary w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Beautiful Exam Paper
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-600 mt-2">
                  Uses mock data if no file uploaded • AI extraction requires API key
                </p>
              </div>

              {/* Pipeline Status */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <PipelineStatus />
            </div>
          </div>

          {/* RIGHT PANEL — Preview */}
          <div className="split-panel flex-1 flex flex-col min-w-0 bg-[#0d1117]">
            <PreviewCanvas />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
