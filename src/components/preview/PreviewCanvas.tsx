'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Eye, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getMockExamData } from '@/data/mockExam';
import { renderExamToHtml } from '@/lib/templates/exam-renderer';

export function PreviewCanvas() {
  const { styleConfig, generatedHtml, currentPage, totalPages, zoom, setCurrentPage, setZoom, extractedData } = useAppStore();
  const [isPending, startTransition] = useTransition();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Generate preview HTML from exam data — pure computation, no effects needed
  const previewHtml = useMemo(() => {
    try {
      const data = extractedData || getMockExamData();
      return generatedHtml || renderExamToHtml(data, styleConfig);
    } catch (err) {
      console.error('Preview generation error:', err);
      return '';
    }
  }, [styleConfig, generatedHtml, extractedData]);

  const handleDownloadPdf = () => {
    setDownloadError(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: previewHtml }),
        });

        if (!response.ok) throw new Error('PDF generation failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ExamBeautify-Paper.pdf';
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download error:', err);
        setDownloadError(err instanceof Error ? err.message : 'Download failed');
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">Live Preview</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg px-1.5 py-0.5">
            <button
              onClick={() => setZoom(zoom - 10)}
              className="p-1 rounded hover:bg-white/[0.06] transition-colors"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <span className="text-xs text-slate-400 font-mono w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(zoom + 10)}
              className="p-1 rounded hover:bg-white/[0.06] transition-colors"
              disabled={zoom >= 150}
            >
              <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Download */}
          <button
            onClick={handleDownloadPdf}
            disabled={isPending}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isPending ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {downloadError}
        </div>
      )}

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-6 bg-[#0d1117]">
        <div className="flex justify-center">
          <div
            className="preview-page bg-white rounded-sm origin-top transition-transform duration-300"
            style={{
              width: `${(210 / 297) * 800}px`,
              minHeight: '800px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full border-0 rounded-sm"
                style={{ minHeight: '1123px', width: '794px', transform: `scale(${(210 / 297) * 800 / 794})`, transformOrigin: 'top left' }}
                title="Exam Preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-[800px] text-slate-400 text-sm">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="font-medium">Preview will appear here</p>
                  <p className="text-xs text-slate-600 mt-1">Upload an exam paper or use mock data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center gap-4 py-2.5 border-t border-white/[0.06]">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
        <span className="text-xs text-slate-400 font-mono">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
