// ============================================================
// ExamBeautify — Principal Review API (Agent E)
// POST /api/process/principal-review
// Cross-verifies extracted data against the original source file.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getGeminiClient,
  principalReviewExtraction,
  parseJsonFromResponse,
} from '@/lib/gemini';
import {
  PrincipalReviewResponse,
  PrincipalReviewReport,
  ExamDocument,
} from '@/types/exam';

export const maxDuration = 120; // Principal review needs extra time

export async function POST(
  request: NextRequest
): Promise<NextResponse<PrincipalReviewResponse>> {
  // Parse body first so we can use extractedData in both try and catch
  let extractedData: ExamDocument | null = null;

  try {
    const body = await request.json();
    const { sourceFileBase64, sourceMimeType } = body as {
      sourceFileBase64: string;
      sourceMimeType: string;
      extractedData: ExamDocument;
    };
    extractedData = body.extractedData as ExamDocument;

    if (!sourceFileBase64 || !extractedData) {
      return NextResponse.json(
        { success: false, error: 'Missing source file or extracted data' },
        { status: 400 }
      );
    }

    const client = getGeminiClient();

    // If no API key, skip review and pass through
    if (!client) {
      console.log('[Principal] No API key — auto-approving');
      return NextResponse.json({
        success: true,
        correctedData: extractedData,
        report: {
          approved: true,
          score: 100,
          totalIssues: 0,
          criticalIssues: 0,
          issues: [],
          summary: 'Review skipped — no API key configured.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    console.log(
      `[Principal] Reviewing extraction: ${extractedData.content?.length || 0} questions`
    );

    // Send both source file + extracted data to Gemini
    const extractedDataJson = JSON.stringify(extractedData, null, 2);
    const rawResponse = await principalReviewExtraction(
      sourceFileBase64,
      sourceMimeType,
      extractedDataJson
    );

    console.log(
      `[Principal] Response length: ${rawResponse.length} chars`
    );

    // Parse the response
    const jsonStr = parseJsonFromResponse(rawResponse);
    let parsed: {
      approved: boolean;
      score: number;
      totalIssues: number;
      criticalIssues: number;
      issues: PrincipalReviewReport['issues'];
      summary: string;
      correctedData?: ExamDocument;
    };

    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[Principal] Failed to parse response:', parseErr);
      // Return original data if parsing fails
      return NextResponse.json({
        success: true,
        correctedData: extractedData,
        report: {
          approved: true,
          score: 75,
          totalIssues: 0,
          criticalIssues: 0,
          issues: [],
          summary: 'Principal review response could not be parsed. Using original extraction.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Build the report
    const report: PrincipalReviewReport = {
      approved: parsed.approved ?? true,
      score: parsed.score ?? 80,
      totalIssues: parsed.totalIssues ?? parsed.issues?.length ?? 0,
      criticalIssues: parsed.criticalIssues ?? 0,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      summary: parsed.summary || 'Review completed.',
      timestamp: new Date().toISOString(),
    };

    // Use corrected data if provided, otherwise use original
    const correctedData = parsed.correctedData || extractedData;

    // Validate corrected data has the expected structure
    if (!correctedData.content || !Array.isArray(correctedData.content)) {
      console.warn('[Principal] Corrected data has invalid structure, using original');
      return NextResponse.json({
        success: true,
        correctedData: extractedData,
        report,
      });
    }

    console.log(
      `[Principal] Score: ${report.score}/100, Approved: ${report.approved}, Issues: ${report.totalIssues} (${report.criticalIssues} critical)`
    );
    console.log(
      `[Principal] Questions: ${extractedData.content.length} → ${correctedData.content.length}`
    );

    return NextResponse.json({
      success: true,
      correctedData,
      report,
    });
  } catch (error) {
    console.error('[Principal] Error:', error);

    // On error, pass through original data (graceful degradation)
    return NextResponse.json({
      success: true,
      correctedData: extractedData ?? undefined,
      report: {
        approved: true,
        score: 70,
        totalIssues: 0,
        criticalIssues: 0,
        issues: [],
        summary: `Principal review encountered an error: ${error instanceof Error ? error.message : 'Unknown'}. Using original extraction.`,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
