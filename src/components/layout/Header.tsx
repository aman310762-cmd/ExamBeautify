'use client';

import React from 'react';
import { Sparkles, FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="relative z-50">
      {/* Pilot Program Banner */}
      <div className="banner-shimmer bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 py-2.5 px-4 text-center">
        <p className="text-sm font-semibold text-white tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 animate-float" />
          <span>School Pilot Program — 100% Free Trial Active (Unlimited Sheets)</span>
          <Sparkles className="w-4 h-4 animate-float" style={{ animationDelay: '0.5s' }} />
        </p>
      </div>

      {/* Main Header */}
      <div className="glass border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ExamBeautify</h1>
              <p className="text-[11px] text-slate-400 -mt-0.5 tracking-wider uppercase">Transform · Stylize · Print</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">AI Engine Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
