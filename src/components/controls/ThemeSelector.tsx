'use client';

import React from 'react';
import { Check, Palette } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ThemeId } from '@/types/exam';
import { THEME_DEFINITIONS } from '@/lib/templates/themes';

const themes = Object.values(THEME_DEFINITIONS);

export function ThemeSelector() {
  const { styleConfig, setTheme } = useAppStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Palette className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-200">Paper Theme</h3>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {themes.map((theme) => {
          const isSelected = styleConfig.theme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
              className={`theme-card relative rounded-xl p-3 text-left transition-all border ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 selected'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              {/* Color preview strip */}
              <div
                className="h-8 rounded-lg mb-2.5 relative overflow-hidden"
                style={{ background: theme.preview }}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-200 leading-tight">{theme.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{theme.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
