import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ExamBeautify — Intelligent Exam Paper Design Platform",
  description:
    "Transform messy, unstructured exam papers into stunning, print-ready A4 PDFs using AI-powered content extraction, intelligent layout design, and automated visual quality assurance.",
  keywords: [
    "exam paper",
    "beautify",
    "PDF generator",
    "AI OCR",
    "exam formatting",
    "print-ready",
    "education",
    "teacher tools",
  ],
  openGraph: {
    title: "ExamBeautify — Transform Exam Papers with AI",
    description:
      "Upload messy exam papers and get stunning, print-ready PDFs in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0e1a]">
        {children}
      </body>
    </html>
  );
}
