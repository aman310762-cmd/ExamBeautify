'use client';

import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-4 px-6 mt-auto">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs text-slate-500">
        <p>© 2025 ExamBeautify — Intelligent Exam Paper Design Platform</p>
        <p className="flex items-center gap-1.5">
          Made with <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> for educators
        </p>
      </div>
    </footer>
  );
}
