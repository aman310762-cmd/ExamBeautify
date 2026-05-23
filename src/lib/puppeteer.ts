// ============================================================
// ExamBeautify — Puppeteer Browser Launcher Utility
// Works on both local (puppeteer) and Vercel (@sparticuz/chromium)
// ============================================================

import type { Browser, Page } from 'puppeteer';

let browserInstance: Browser | null = null;

/**
 * Detect if running on Vercel (serverless) or AWS Lambda.
 */
function isServerless(): boolean {
  return !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

/**
 * Get or create a shared Puppeteer browser instance.
 * - Vercel: uses @sparticuz/chromium + puppeteer-core
 * - Render/Local: uses regular puppeteer with bundled Chromium
 */
export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  if (isServerless()) {
    // Serverless (Vercel): use @sparticuz/chromium + puppeteer-core
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteerCore = (await import('puppeteer-core')).default;

    browserInstance = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath: await chromium.executablePath(),
      headless: true,
    }) as unknown as Browser;
  } else {
    // Local or Render: use full puppeteer with bundled Chromium
    const puppeteer = (await import('puppeteer')).default;

    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
        '--single-process',       // Render free tier needs this
      ],
    });
  }

  return browserInstance;
}

/**
 * Close the shared browser instance.
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Wait for all external resources (fonts, CSS) to load on the page
 */
async function waitForResources(page: Page): Promise<void> {
  // Wait for fonts to load (including KaTeX fonts from CDN)
  await page.evaluateHandle('document.fonts.ready');
  // Wait for any remaining network requests and rendering
  await new Promise(resolve => setTimeout(resolve, 2500));
}

/**
 * Render HTML content to a PDF buffer with A4 dimensions.
 * Supports multi-page content that flows naturally across A4 sheets.
 */
export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Navigate to a blank page first, then set content — allows external resources to load
    await page.goto('about:blank');
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 30000,
    });

    await waitForResources(page);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      preferCSSPageSize: false,  // Let Puppeteer handle multi-page pagination
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
    // On Vercel, close browser after each request to free resources
    if (isServerless()) {
      await closeBrowser();
    }
  }
}

/**
 * Render HTML content and capture a PNG screenshot for QA.
 */
export async function renderHtmlToScreenshot(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport to A4 pixel equivalent (96 DPI)
    await page.setViewport({
      width: 794,  // 210mm at 96 DPI
      height: 1123, // 297mm at 96 DPI
      deviceScaleFactor: 2,
    });

    await page.goto('about:blank');
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 30000,
    });

    await waitForResources(page);

    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
    });

    return Buffer.from(screenshot);
  } finally {
    await page.close();
    if (isServerless()) {
      await closeBrowser();
    }
  }
}

/**
 * Convert a PDF file to base64 images (one per page) using Puppeteer.
 * Returns an array of base64-encoded PNG images.
 */
export async function pdfToImages(pdfBase64: string): Promise<string[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const images: string[] = [];

  try {
    // Create a data URL for the PDF
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`;

    // Set a viewport
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    // Navigate to the PDF
    await page.goto(pdfDataUrl, {
      waitUntil: 'load',
      timeout: 30000,
    });

    // Wait for PDF to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a full page screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png',
    });

    images.push(Buffer.from(screenshot).toString('base64'));
  } catch (err) {
    console.warn('[Puppeteer] PDF to image conversion failed:', err);
  } finally {
    await page.close();
    if (isServerless()) {
      await closeBrowser();
    }
  }

  return images;
}
