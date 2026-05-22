// ============================================================
// ExamBeautify — PDF Generation API
// POST /api/generate-pdf
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html } = body as { html: string };

    if (!html) {
      return NextResponse.json(
        { error: 'Missing HTML content' },
        { status: 400 }
      );
    }

    console.log(`[PDF] Generating PDF from HTML (${html.length} chars)`);

    // Dynamic import for puppeteer (server-side only)
    const { renderHtmlToPdf } = await import('@/lib/puppeteer');
    const pdfBuffer = await renderHtmlToPdf(html);
    const uint8 = new Uint8Array(pdfBuffer);

    console.log(`[PDF] Generated PDF: ${pdfBuffer.length} bytes`);

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="ExamBeautify-Paper.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[PDF] Error:', error);
    return NextResponse.json(
      { error: 'PDF generation failed: ' + (error instanceof Error ? error.message : 'unknown') },
      { status: 500 }
    );
  }
}
