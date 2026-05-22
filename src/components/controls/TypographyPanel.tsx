'use client';

import React from 'react';
import { Type } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FontFamily } from '@/types/exam';

const FONTS: { id: FontFamily; label: string; sample: string }[] = [
  { id: 'Inter', label: 'Inter', sample: 'Modern & Clean' },
  { id: 'Roboto', label: 'Roboto', sample: 'Professional' },
  { id: 'Times New Roman', label: 'Times New Roman', sample: 'Traditional' },
];

export function TypographyPanel() {
  const { styleConfig, setFontFamily, setFontSize, setLineHeight } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Type className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-200">Typography</h3>
      </div>

      {/* Font Family */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Font Family</label>
        <select
          value={styleConfig.fontFamily}
          onChange={(e) => setFontFamily(e.target.value as FontFamily)}
          className="w-full"
        >
          {FONTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label} — {f.sample}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-slate-400">Font Size</label>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {styleConfig.fontSize}pt
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={14}
          step={0.5}
          value={styleConfig.fontSize}
          onChange={(e) => setFontSize(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>10pt</span>
          <span>14pt</span>
        </div>
      </div>

      {/* Line Height */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-slate-400">Line Height</label>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {styleConfig.lineHeight.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min={1.2}
          max={2.0}
          step={0.1}
          value={styleConfig.lineHeight}
          onChange={(e) => setLineHeight(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>Tight</span>
          <span>Relaxed</span>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="text-[10px] text-slate-500 mb-2">Preview</p>
        <p
          className="text-slate-300"
          style={{
            fontFamily: styleConfig.fontFamily === 'Times New Roman' ? '"Times New Roman", serif' : `"${styleConfig.fontFamily}", sans-serif`,
            fontSize: `${styleConfig.fontSize}px`,
            lineHeight: styleConfig.lineHeight,
          }}
        >
          Q.1 Evaluate ∫₀^π sin(x) dx and state the result.
        </p>
      </div>
    </div>
  );
}
