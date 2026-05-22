'use client';

import React from 'react';
import { Upload, Search, Paintbrush, ShieldCheck, FileDown, Loader2, Check, AlertTriangle, GraduationCap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PipelineStep, StepStatus } from '@/types/exam';

interface StepConfig {
  id: PipelineStep;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: 'upload', label: 'Upload & Validate', description: 'File ingestion and validation', icon: <Upload className="w-4 h-4" /> },
  { id: 'extract', label: 'Content Extraction', description: 'AI-powered OCR & parsing', icon: <Search className="w-4 h-4" /> },
  { id: 'principal-review', label: 'Principal Review', description: 'Cross-verification & corrections', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'layout', label: 'Layout Generation', description: 'Template design & styling', icon: <Paintbrush className="w-4 h-4" /> },
  { id: 'qa', label: 'Quality Assurance', description: 'Visual audit & corrections', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'pdf', label: 'PDF Ready', description: 'Final document generation', icon: <FileDown className="w-4 h-4" /> },
];

function getStatusIcon(status: StepStatus) {
  switch (status) {
    case 'active':
      return <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />;
    case 'complete':
      return <Check className="w-3.5 h-3.5 text-emerald-400" />;
    case 'error':
      return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    default:
      return null;
  }
}

export function PipelineStatus() {
  const { stepStatuses, principalReport } = useAppStore();

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        Processing Pipeline
      </h3>

      <div className="space-y-0.5">
        {STEPS.map((step, index) => {
          const status = stepStatuses[step.id];
          const isActive = status === 'active';
          const isComplete = status === 'complete';
          const isError = status === 'error';

          // Special styling for principal review step
          const isPrincipal = step.id === 'principal-review';
          const principalScore = isPrincipal && principalReport ? principalReport.score : null;
          const principalApproved = isPrincipal && principalReport ? principalReport.approved : null;

          return (
            <div key={step.id}>
              <div
                className={`pipeline-step flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive ? 'active bg-indigo-500/8 border border-indigo-500/20' :
                  isComplete && isPrincipal && principalApproved === false ? 'bg-amber-500/5 border border-amber-500/15' :
                  isComplete ? 'bg-emerald-500/5' :
                  isError ? 'bg-rose-500/5' :
                  'opacity-50'
                }`}
              >
                {/* Step dot/icon */}
                <div
                  className={`step-dot w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-indigo-500/20 text-indigo-400' :
                    isComplete && isPrincipal && principalApproved === false ? 'bg-amber-500/15 text-amber-400' :
                    isComplete ? 'bg-emerald-500/15 text-emerald-400' :
                    isError ? 'bg-rose-500/15 text-rose-400' :
                    'bg-white/[0.04] text-slate-600'
                  }`}
                >
                  {step.icon}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${
                    isActive ? 'text-indigo-300' :
                    isComplete && isPrincipal && principalApproved === false ? 'text-amber-300' :
                    isComplete ? 'text-emerald-300' :
                    isError ? 'text-rose-300' :
                    'text-slate-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-600 truncate">
                    {/* Show principal review details when available */}
                    {isPrincipal && isComplete && principalReport ? (
                      <span className={principalScore && principalScore >= 90 ? 'text-emerald-500' : principalScore && principalScore >= 70 ? 'text-amber-500' : 'text-rose-500'}>
                        Score: {principalScore}/100 · {principalReport.totalIssues} issue{principalReport.totalIssues !== 1 ? 's' : ''} found
                        {principalReport.criticalIssues > 0 && ` (${principalReport.criticalIssues} critical)`}
                        {principalReport.totalIssues > 0 && ' · Auto-corrected ✓'}
                      </span>
                    ) : (
                      step.description
                    )}
                  </p>
                </div>

                {/* Status icon */}
                <div className="shrink-0">
                  {isPrincipal && isComplete && principalScore !== null ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      principalScore >= 90 ? 'bg-emerald-500/15 text-emerald-400' :
                      principalScore >= 70 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-rose-500/15 text-rose-400'
                    }`}>
                      {principalScore}%
                    </span>
                  ) : (
                    getStatusIcon(status)
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex justify-start ml-[22px] py-0.5">
                  <div className={`w-px h-3 ${
                    isComplete ? 'bg-emerald-500/30' : 'bg-white/[0.06]'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Principal Review Summary Card */}
      {principalReport && principalReport.totalIssues > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold text-slate-300">Principal&apos;s Report</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
            {principalReport.summary}
          </p>
          {principalReport.issues.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {principalReport.issues.slice(0, 5).map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px]">
                  <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${
                    issue.severity === 'critical' ? 'bg-rose-400' :
                    issue.severity === 'warning' ? 'bg-amber-400' :
                    'bg-slate-500'
                  }`} />
                  <span className="text-slate-500">
                    {issue.questionNumber ? `Q${issue.questionNumber}: ` : ''}
                    {issue.description}
                  </span>
                </div>
              ))}
              {principalReport.issues.length > 5 && (
                <p className="text-[10px] text-slate-600 italic">
                  +{principalReport.issues.length - 5} more issues corrected
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
