// ============================================================
// ExamBeautify — Layout Generation API (Agent C)
// POST /api/process/layout
// Always uses the built-in template engine for reliability.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { renderExamToHtml } from '@/lib/templates/exam-renderer';
import { ExamDocument, StyleConfig, LayoutResponse } from '@/types/exam';

export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse<LayoutResponse>> {
  try {
    const body = await request.json();
    const { examData, styleConfig } = body as { examData: ExamDocument; styleConfig: StyleConfig };

    if (!examData || !styleConfig) {
      return NextResponse.json(
        { success: false, error: 'Missing examData or styleConfig' },
        { status: 400 }
      );
    }

    console.log(`[Layout] Generating layout for ${examData.content.length} questions with theme: ${styleConfig.theme}`);

    // Always use built-in template engine — it's reliable, consistent, and fast
    const html = renderExamToHtml(examData, styleConfig);

    const pageCount = estimatePageCount(examData, styleConfig);
    console.log(`[Layout] Generated HTML (${html.length} chars), estimated ${pageCount} pages`);

    return NextResponse.json({
      success: true,
      html,
      pageCount,
    });
  } catch (error) {
    console.error('[Layout] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Layout generation failed: ' + (error instanceof Error ? error.message : 'unknown') },
      { status: 500 }
    );
  }
}

function estimatePageCount(exam: ExamDocument, config: StyleConfig): number {
  let totalHeight = 200; // Header + instructions estimate in pt

  for (const q of exam.content) {
    let qHeight = 30; // Base question height

    if (q.type === 'MCQ' && q.options) {
      qHeight += Math.ceil(q.options.length / 2) * 20;
    }

    if (q.hasMath && q.latexEquations.length > 0) {
      qHeight += q.latexEquations.length * 25;
    }

    if (q.hasDiagram) {
      qHeight += 200;
    }

    if (q.subParts) {
      qHeight += q.subParts.length * 25;
    }

    if (config.layoutMode === 'worksheet' && q.type !== 'MCQ') {
      qHeight += q.marks >= 4 ? 90 : 50;
    }

    totalHeight += qHeight;
  }

  // A4 printable area height ≈ 770pt (297mm - 40mm margins)
  return Math.max(1, Math.ceil(totalHeight / 770));
}
