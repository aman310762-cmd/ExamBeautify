// ============================================================
// ExamBeautify — Content Extraction API (Agent B)
// POST /api/process/extract
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { extractContentFromFile, getGeminiClient, parseJsonFromResponse } from '@/lib/gemini';
import { getMockExamData } from '@/data/mockExam';
import { ExamDocument, ExtractResponse } from '@/types/exam';

export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse<ExtractResponse>> {
  try {
    const body = await request.json();
    const { fileBase64, fileType, fileName } = body;

    // Check if Gemini API is available
    const client = getGeminiClient();
    if (!client) {
      console.log('[Extract] No API key — returning mock data for:', fileName);
      return NextResponse.json({
        success: true,
        data: getMockExamData(),
      });
    }

    // If no file uploaded, return mock data
    if (!fileBase64 || !fileType) {
      console.log('[Extract] No file provided — returning mock data');
      return NextResponse.json({
        success: true,
        data: getMockExamData(),
      });
    }

    // Call Gemini for extraction
    console.log(`[Extract] Processing file: ${fileName} (${fileType}, ${Math.round(fileBase64.length * 0.75 / 1024)}KB)`);

    const rawResponse = await extractContentFromFile(fileBase64, fileType);
    console.log(`[Extract] Gemini response length: ${rawResponse.length} chars`);

    // Parse JSON from response
    const jsonStr = parseJsonFromResponse(rawResponse);
    const examData: ExamDocument = JSON.parse(jsonStr);

    // Validate the parsed data has content
    if (!examData.content || examData.content.length === 0) {
      console.warn('[Extract] Gemini returned empty content, falling back to mock data');
      return NextResponse.json({
        success: true,
        data: getMockExamData(),
      });
    }

    console.log(`[Extract] Successfully extracted ${examData.content.length} questions for ${examData.examMetadata.subject}`);

    return NextResponse.json({
      success: true,
      data: examData,
    });
  } catch (error) {
    console.error('[Extract] Error:', error);

    // Fallback to mock data on error
    return NextResponse.json({
      success: true,
      data: getMockExamData(),
    });
  }
}
