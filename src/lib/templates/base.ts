// ============================================================
// ExamBeautify — Base HTML Template for PDF Generation
// ============================================================

import { getKatexCssTag } from '@/lib/katex-renderer';
import { StyleConfig, ThemeDefinition } from '@/types/exam';
import { THEME_DEFINITIONS } from '@/lib/templates/themes';

/**
 * Generate the base HTML document wrapper for an exam paper.
 */
export function generateBaseHtml(
  bodyContent: string,
  config: StyleConfig
): string {
  const theme = THEME_DEFINITIONS[config.theme];
  const fontLink = getFontLink(config.fontFamily);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ExamBeautify - Generated Exam Paper</title>
  ${getKatexCssTag()}
  ${fontLink}
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${getBaseStyles(config, theme)}
    ${getPrintStyles()}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

function getFontLink(fontFamily: string): string {
  const fontMap: Record<string, string> = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'Times New Roman': '',
  };
  const url = fontMap[fontFamily] || fontMap['Inter'];
  return url ? `<link href="${url}" rel="stylesheet">` : '';
}

function getBaseStyles(config: StyleConfig, theme: ThemeDefinition): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: '${config.fontFamily}', 'Noto Sans Devanagari', sans-serif;
      font-size: ${config.fontSize}pt;
      line-height: ${config.lineHeight};
      color: ${theme.colors.text};
      background: white;
    }

    /* Page container — flows naturally across multiple A4 sheets */
    .page {
      width: 210mm;
      padding: 18mm 20mm;
      margin: 0 auto;
      background: ${theme.colors.surface};
      position: relative;
    }

    /* Header */
    .exam-header {
      text-align: center;
      padding-bottom: 10pt;
      margin-bottom: 12pt;
      border-bottom: 2.5px solid ${theme.colors.primary};
    }

    .school-name {
      font-size: ${config.fontSize + 5}pt;
      font-weight: 700;
      color: ${theme.colors.headerText};
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 3pt;
    }

    .exam-title {
      font-size: ${config.fontSize + 2}pt;
      font-weight: 600;
      color: ${theme.colors.primary};
      margin-bottom: 5pt;
    }

    .exam-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: ${config.fontSize - 1}pt;
      color: ${theme.colors.muted};
      padding: 3pt 0;
    }

    .exam-meta-row span {
      font-weight: 500;
    }

    .student-info {
      display: flex;
      gap: 16pt;
      margin: 8pt 0;
      padding: 6pt 10pt;
      border: 1px solid ${theme.colors.border};
      border-radius: 3px;
      background: ${theme.colors.background};
    }

    .student-info-field {
      flex: 1;
      font-size: ${config.fontSize - 1}pt;
    }

    .student-info-field label {
      font-weight: 600;
      color: ${theme.colors.muted};
    }

    .student-info-field .line {
      border-bottom: 1px solid ${theme.colors.border};
      min-width: 80pt;
      display: inline-block;
      margin-left: 4pt;
      min-height: 12pt;
    }

    /* Instructions */
    .instructions {
      margin: 10pt 0;
      padding: 8pt 12pt;
      border-left: 3px solid ${theme.colors.accent};
      background: ${theme.colors.background};
      border-radius: 0 3px 3px 0;
      font-size: ${config.fontSize - 1}pt;
    }

    .instructions-title {
      font-weight: 700;
      font-size: ${config.fontSize - 0.5}pt;
      margin-bottom: 4pt;
      color: ${theme.colors.primary};
    }

    .instructions ol {
      padding-left: 16pt;
      color: ${theme.colors.muted};
    }

    .instructions ol li {
      margin-bottom: 2pt;
    }

    /* Section header */
    .section-header {
      font-size: ${config.fontSize + 1}pt;
      font-weight: 700;
      color: ${theme.colors.headerText};
      background: ${theme.colors.headerBg};
      padding: 5pt 10pt;
      margin: 14pt 0 8pt 0;
      border-radius: 3px;
      page-break-after: avoid;
    }

    /* Questions */
    .question-block {
      margin-bottom: ${config.layoutMode === 'compact' ? '6pt' : '10pt'};
      page-break-inside: avoid;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 3pt;
    }

    .question-number {
      font-weight: 700;
      color: ${theme.colors.primary};
      min-width: 28pt;
      display: inline;
    }

    .question-text-inline {
      display: inline;
    }

    .question-marks {
      font-size: ${config.fontSize - 1}pt;
      color: ${theme.colors.accent};
      font-weight: 600;
      white-space: nowrap;
    }

    .question-text {
      margin-left: 28pt;
      margin-bottom: 4pt;
    }

    /* MCQ Options */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3pt 12pt;
      margin-left: 28pt;
      margin-top: 4pt;
    }

    .option-item {
      display: flex;
      align-items: baseline;
      gap: 4pt;
      padding: 2pt 4pt;
      border-radius: 2px;
    }

    .option-label {
      font-weight: 600;
      color: ${theme.colors.primary};
      min-width: 18pt;
    }

    /* Diagram container */
    .diagram-container {
      margin: 8pt 28pt;
      text-align: center;
      page-break-inside: avoid;
    }

    .diagram-container svg {
      max-width: 100%;
      height: auto;
    }

    /* Sub-parts */
    .sub-parts {
      margin-left: 36pt;
      margin-top: 4pt;
    }

    .sub-part {
      margin-bottom: 3pt;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 2pt;
    }

    .sub-part-label {
      font-weight: 600;
      color: ${theme.colors.secondary};
      margin-right: 4pt;
    }

    /* Answer space (worksheet mode) */
    .answer-space {
      margin: 6pt 28pt;
      border: 1px solid ${theme.colors.border};
      border-radius: 3px;
      padding: 3pt;
      min-height: ${config.layoutMode === 'worksheet' ? '50pt' : '0'};
      background: repeating-linear-gradient(
        transparent,
        transparent 20px,
        ${theme.colors.border}33 20px,
        ${theme.colors.border}33 21px
      );
    }

    .answer-space.large {
      min-height: ${config.layoutMode === 'worksheet' ? '90pt' : '0'};
    }

    /* KaTeX overrides for proper sizing */
    .katex {
      font-size: 1.05em !important;
    }

    .katex-display {
      margin: 4pt 0 !important;
      overflow-x: auto;
    }

    .katex-display > .katex {
      display: inline-block;
      text-align: center;
    }

    /* Fallback math styling */
    .katex-fallback {
      font-family: 'Times New Roman', serif;
      font-style: italic;
    }

    /* Hindi text */
    .hindi-text {
      font-family: 'Noto Sans Devanagari', sans-serif;
      margin-left: 28pt;
      color: ${theme.colors.muted};
      font-style: italic;
      margin-bottom: 4pt;
    }

    /* Bilingual separator */
    .bilingual-separator {
      color: ${theme.colors.muted};
      margin: 0 4pt;
      font-style: italic;
    }
  `;
}

function getPrintStyles(): string {
  return `
    @media print {
      body {
        background: white;
      }
      .page {
        margin: 0;
        padding: 18mm 20mm;
        box-shadow: none;
        width: 210mm;
      }
      .question-block {
        page-break-inside: avoid;
      }
      .section-header {
        page-break-after: avoid;
      }
    }

    @page {
      size: A4;
      margin: 0;
    }
  `;
}
