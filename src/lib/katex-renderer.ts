// ============================================================
// ExamBeautify — KaTeX Server-Side Renderer
// ============================================================

import katex from 'katex';

// We use CDN for the CSS link in client-rendered previews,
// and for the PDF generation, Puppeteer will load the CSS from CDN using `waitUntil: 'load'`
const KATEX_CDN_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';

/**
 * Render a single LaTeX string to HTML using KaTeX SSR.
 * Falls back to styled raw TeX on parse failure.
 */
export function renderLatex(tex: string, displayMode: boolean = false): string {
  if (!tex || tex.trim() === '') return '';
  
  // Clean up common issues in Gemini-extracted LaTeX
  const cleanTex = tex.trim();
  
  try {
    return katex.renderToString(cleanTex, {
      throwOnError: false,
      displayMode,
      output: 'html',
      strict: false,
      trust: true,
    });
  } catch {
    // Try again with less strict parsing
    try {
      return katex.renderToString(cleanTex, {
        throwOnError: false,
        displayMode,
        output: 'html',
        strict: 'ignore',
        trust: true,
      });
    } catch {
      return `<span class="katex-fallback" style="font-family: 'Times New Roman', serif; font-style: italic; color: #1e293b;">${escapeHtml(tex)}</span>`;
    }
  }
}

/**
 * Render an array of LaTeX equations to HTML.
 */
export function renderLatexArray(equations: string[], displayMode: boolean = true): string[] {
  return equations.filter(eq => eq != null).map((eq) => renderLatex(eq, displayMode));
}

/**
 * Get the KaTeX CSS link tag for embedding in HTML documents.
 * Uses CDN for simplicity — Puppeteer's waitUntil: 'load' ensures it loads.
 */
export function getKatexCssLink(): string {
  return `<link rel="stylesheet" href="${KATEX_CDN_CSS}" crossorigin="anonymous">`;
}

/**
 * Get the KaTeX CSS — includes both CDN link and critical inline styles
 * so math renders correctly even if CDN is slow.
 */
export function getKatexCssTag(): string {
  // CDN link for full CSS + fonts
  const cdnLink = `<link rel="stylesheet" href="${KATEX_CDN_CSS}" crossorigin="anonymous">`;
  
  // Critical inline CSS for core math rendering as fallback
  const criticalCss = `<style>
/* KaTeX critical fallback CSS */
.katex { font: normal 1.21em KaTeX_Main, 'Times New Roman', serif; text-indent: 0; white-space: nowrap; }
.katex .katex-html { display: inline-block; }
.katex .base { display: inline-block; white-space: nowrap; width: auto; }
.katex .mord, .katex .mop, .katex .mrel, .katex .mbin,
.katex .mopen, .katex .mclose, .katex .mpunct, .katex .minner { display: inline-block; }
.katex .mfrac { display: inline-block; vertical-align: -0.5em; text-align: center; }
.katex .mfrac > .vlist-t2 { display: inline-table; }
.katex .mfrac .frac-line { width: 100%; min-height: 1px; border-bottom: 1px solid currentColor; }
.katex .mfrac > span > span { display: block; text-align: center; }
.katex .sqrt { display: inline-block; }
.katex .op-symbol { position: relative; }
.katex .msupsub { text-align: left; }
.katex .vlist-t { display: inline-table; table-layout: fixed; border-collapse: collapse; }
.katex .vlist-t2 { display: inline-table; table-layout: fixed; }
.katex .vlist-r { display: table-row; }
.katex .vlist { display: table-cell; vertical-align: bottom; position: relative; }
.katex .vlist > span { display: block; position: relative; }
.katex .pstrut { width: 0; display: inline-block; }
.katex .sizing { display: inline-block; }
.katex .delimsizing { display: inline-block; }
.katex .nulldelimiter { display: inline-block; width: 0; }
.katex .text { font-family: 'Times New Roman', serif; }
.katex-display { display: block; margin: 0.5em 0; text-align: center; }
.katex-display > .katex { display: inline-block; text-align: center; }
.katex-fallback { font-family: 'Times New Roman', serif; font-style: italic; }
</style>`;

  return cdnLink + '\n' + criticalCss;
}

/**
 * Process an HTML string and replace inline/display LaTeX markers.
 */
export function processLatexInHtml(html: string): string {
  // Replace display LaTeX markers: $$...$$
  html = html.replace(/\$\$([^$]+)\$\$/g, (_, tex) => renderLatex(tex, true));
  
  // Replace inline LaTeX markers: $...$
  html = html.replace(/\$([^$]+)\$/g, (_, tex) => renderLatex(tex, false));

  // Replace data-latex attributes
  html = html.replace(
    /<span[^>]*data-latex="([^"]*)"[^>]*>.*?<\/span>/g,
    (_, tex) => renderLatex(decodeHtmlEntities(tex), true)
  );

  return html;
}

function escapeHtml(text: string): string {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
