// ============================================================
// ExamBeautify — Exam Content to HTML Renderer
// Converts ExamDocument + StyleConfig into a complete HTML page.
// Null-safe: handles missing or malformed data gracefully.
// ============================================================

import { ExamDocument, QuestionContent, StyleConfig } from '@/types/exam';
import { generateBaseHtml } from '@/lib/templates/base';
import { renderLatex } from '@/lib/katex-renderer';
import { generateSvgFromDescription } from '@/lib/svg-generator';

/**
 * Render a complete exam document to an HTML string ready for Puppeteer.
 */
export function renderExamToHtml(
  exam: ExamDocument,
  config: StyleConfig
): string {
  const bodyContent = generateExamBody(exam, config);
  return generateBaseHtml(bodyContent, config);
}

function generateExamBody(exam: ExamDocument, config: StyleConfig): string {
  const sections = groupBySections(exam.content || []);

  return `
    <div class="page">
      ${renderHeader(exam)}
      ${renderStudentInfo()}
      ${renderInstructions(exam)}
      ${Object.entries(sections).map(([section, questions]) =>
        renderSection(section, questions, config)
      ).join('\n')}
    </div>
  `;
}

function renderHeader(exam: ExamDocument): string {
  const meta = exam.examMetadata || {};
  const schoolName = meta.schoolName || '';
  const examTitle = meta.examTitle || '';
  const subject = meta.subject || 'General';
  const totalMarks = meta.totalMarks || '';
  const timeAllowed = meta.timeAllowed || '';
  const className = meta.className || '';
  const date = meta.date || '';

  return `
    <div class="exam-header">
      ${schoolName ? `<div class="school-name">${escapeHtml(schoolName)}</div>` : ''}
      ${examTitle ? `<div class="exam-title">${escapeHtml(examTitle)}</div>` : ''}
      <div class="exam-meta-row">
        <span>Subject: ${escapeHtml(subject)}</span>
        ${className ? `<span>Class: ${escapeHtml(className)}</span>` : ''}
        ${date ? `<span>Date: ${escapeHtml(date)}</span>` : ''}
      </div>
      <div class="exam-meta-row">
        ${totalMarks ? `<span>Maximum Marks: ${totalMarks}</span>` : ''}
        ${timeAllowed ? `<span>Time Allowed: ${escapeHtml(timeAllowed)}</span>` : ''}
      </div>
    </div>
  `;
}

function renderStudentInfo(): string {
  return `
    <div class="student-info">
      <div class="student-info-field">
        <label>Name:</label><span class="line"></span>
      </div>
      <div class="student-info-field">
        <label>Roll No:</label><span class="line"></span>
      </div>
      <div class="student-info-field">
        <label>Section:</label><span class="line"></span>
      </div>
    </div>
  `;
}

function renderInstructions(exam: ExamDocument): string {
  const instructions = exam.examMetadata?.instructions;
  if (!instructions || !Array.isArray(instructions) || instructions.length === 0) return '';

  return `
    <div class="instructions">
      <div class="instructions-title">General Instructions:</div>
      <ol>
        ${instructions
          .filter(i => i != null && String(i).trim() !== '')
          .map(i => `<li>${escapeHtml(String(i))}</li>`)
          .join('\n        ')}
      </ol>
    </div>
  `;
}

function renderSection(section: string, questions: QuestionContent[], config: StyleConfig): string {
  // Use the exact section name from the paper
  // Only hide if section is 'General' (no section specified)
  const isGeneral = section === 'General';
  const sectionMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const sectionHeader = !isGeneral
    ? `<div class="section-header">${escapeHtml(section)}${sectionMarks > 0 ? ` (${sectionMarks} Marks)` : ''}</div>`
    : '';

  return `
    ${sectionHeader}
    ${questions.map(q => renderQuestion(q, config)).join('\n')}
  `;
}

function renderQuestion(q: QuestionContent, config: StyleConfig): string {
  const questionText = q.text || '';
  const questionNumber = q.questionNumber || '?';
  const marks = q.marks || 0;

  // Process question text — render inline math if present
  const processedText = processTextWithMath(questionText);

  let html = `
    <div class="question-block">
      <div class="question-header">
        <span>
          <span class="question-number">Q.${questionNumber}</span>
          <span class="question-text-inline">${processedText}</span>
        </span>
        ${marks > 0 ? `<span class="question-marks">[${marks} Mark${marks > 1 ? 's' : ''}]</span>` : ''}
      </div>
  `;

  // Render bilingual text
  if (q.language === 'bilingual' && q.hindiText) {
    html += `<div class="hindi-text">${escapeHtml(q.hindiText)}</div>`;
  }

  // Render LaTeX equations as display math
  if (q.hasMath && q.latexEquations && q.latexEquations.length > 0) {
    html += `<div class="question-text">`;
    q.latexEquations.forEach(eq => {
      if (eq) {
        html += `<div style="margin: 3pt 0;">${renderLatex(eq, true)}</div>`;
      }
    });
    html += `</div>`;
  }

  // Render MCQ options
  if (q.type === 'MCQ' && q.options && q.options.length > 0) {
    html += renderOptions(q.options);
  }

  // Render diagram
  if (q.hasDiagram && q.diagramDescription) {
    html += renderDiagram(q.diagramDescription);
  }

  // Render sub-parts
  if (q.subParts && q.subParts.length > 0) {
    html += renderSubParts(q.subParts);
  }

  // Render answer space (worksheet mode)
  if (config.layoutMode === 'worksheet' && q.type !== 'MCQ') {
    const sizeClass = marks >= 4 ? 'large' : '';
    html += `<div class="answer-space ${sizeClass}"></div>`;
  }

  html += `</div>`;
  return html;
}

/**
 * Process text that may contain inline math notation.
 * Converts LaTeX-like patterns ($...$) and common Unicode math symbols.
 */
function processTextWithMath(text: string): string {
  if (!text) return '';
  
  let processed = escapeHtml(text);
  
  // Unescape HTML entities that are actually needed for display
  // Handle common math Unicode symbols that got escaped
  processed = processed
    .replace(/&amp;/g, '&')
    .replace(/→/g, '→')
    .replace(/←/g, '←')
    .replace(/≤/g, '≤')
    .replace(/≥/g, '≥')
    .replace(/≠/g, '≠')
    .replace(/±/g, '±')
    .replace(/×/g, '×')
    .replace(/÷/g, '÷')
    .replace(/∞/g, '∞')
    .replace(/π/g, 'π')
    .replace(/θ/g, 'θ')
    .replace(/λ/g, 'λ')
    .replace(/μ/g, 'μ')
    .replace(/ε/g, 'ε')
    .replace(/Ω/g, 'Ω');
  
  return processed;
}

/**
 * Render an option, handling math content in options
 */
function renderOptions(options: string[]): string {
  const labels = ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)'];
  return `
    <div class="options-grid">
      ${options
        .filter(opt => opt != null)
        .map((opt, i) => {
          const optText = String(opt);
          // Check if option contains LaTeX-like content
          const processed = processTextWithMath(optText);
          return `
        <div class="option-item">
          <span class="option-label">${labels[i] || `(${String.fromCharCode(97 + i)})`}</span>
          <span>${processed}</span>
        </div>`;
        }).join('')}
    </div>
  `;
}

/**
 * Render diagram — either SVG or descriptive placeholder
 */
function renderDiagram(description: string): string {
  if (!description) return '';
  
  try {
    const svg = generateSvgFromDescription(description);
    return `
      <div class="diagram-container">
        ${svg}
      </div>
    `;
  } catch {
    // Render a descriptive placeholder
    return `
      <div class="diagram-container" style="padding: 12pt; border: 1px solid #e2e8f0; border-radius: 4px; background: #f8fafc;">
        <div style="font-size: 0.85em; color: #475569; text-align: left; font-style: italic;">
          <strong style="color: #1e293b;">📐 Diagram:</strong> ${escapeHtml(description.substring(0, 200))}${description.length > 200 ? '...' : ''}
        </div>
      </div>
    `;
  }
}

function renderSubParts(subParts: QuestionContent['subParts']): string {
  if (!subParts || subParts.length === 0) return '';
  return `
    <div class="sub-parts">
      ${subParts
        .filter(sp => sp != null)
        .map(sp => {
          const spText = sp.text || '';
          const spMarks = sp.marks || 0;
          const processedText = processTextWithMath(spText);
          
          let partHtml = `
            <div class="sub-part">
              <span class="sub-part-label">${escapeHtml(sp.label || '')}</span>
              <span>${processedText}</span>`;

          if (sp.hasMath && sp.latexEquations && sp.latexEquations.length > 0) {
            sp.latexEquations.forEach(eq => {
              if (eq) {
                partHtml += `<div style="margin:3pt 0 3pt 24pt;">${renderLatex(eq, true)}</div>`;
              }
            });
          }

          if (spMarks > 0) {
            partHtml += `<span class="question-marks" style="margin-left:6pt;">[${spMarks}]</span>`;
          }

          partHtml += `</div>`;
          return partHtml;
        }).join('')}
    </div>
  `;
}

function groupBySections(content: QuestionContent[]): Record<string, QuestionContent[]> {
  const sections: Record<string, QuestionContent[]> = {};
  if (!content) return sections;

  content.forEach(q => {
    if (!q) return;
    const section = q.section || 'General';
    if (!sections[section]) sections[section] = [];
    sections[section].push(q);
  });
  return sections;
}

/**
 * Null-safe HTML escaper
 */
function escapeHtml(text: string | null | undefined): string {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
