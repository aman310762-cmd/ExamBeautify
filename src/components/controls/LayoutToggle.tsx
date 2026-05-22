'use client';

import React from 'react';
import { LayoutGrid, FileSpreadsheet, Minus, Maximize2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { LayoutMode } from '@/types/exam';

const MODES: { id: LayoutMode; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'compact',
    label: 'Compact Test',
    description: 'Minimizes space to save paper',
    icon: <Minus className="w-4 h-4" />,
  },
  {
    id: 'worksheet',
    label: 'Worksheet Mode',
    description: 'Adds answer boxes & lined areas',
    icon: <Maximize2 className="w-4 h-4" />,
  },
];

export function LayoutToggle() {
  const { styleConfig, setLayoutMode } = useAppStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <LayoutGrid className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-200">Layout Mode</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MODES.map((mode) => {
          const isSelected = styleConfig.layoutMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setLayoutMode(mode.id)}
              className={`relative rounded-xl p-3 text-left transition-all border ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.04] text-slate-500'
              }`}>
                {mode.icon}
              </div>
              <p className="text-xs font-semibold text-slate-200">{mode.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{mode.description}</p>
            </button>
          );
        })}
      </div>

      {/* Visual indicator */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>
            {styleConfig.layoutMode === 'compact'
              ? 'Questions packed tightly — ideal for MCQ tests'
              : 'Lined answer areas included — ideal for written exams'}
          </span>
        </div>
      </div>
    </div>
  );
}
