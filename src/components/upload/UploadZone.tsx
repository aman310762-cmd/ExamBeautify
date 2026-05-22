'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileImage, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UploadedFile } from '@/types/exam';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { files, addFile, removeFile, updateFileStatus, updateFileProgress } = useAppStore();

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.type}. Accepted: JPG, PNG, PDF`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`;
    }
    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const id = generateId();
    const error = validateFile(file);

    const uploadedFile: UploadedFile = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: error ? 'error' : 'validating',
      progress: 0,
      error: error || undefined,
    };

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedFile.preview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    addFile(uploadedFile);

    if (error) return;

    // Simulate upload progress
    updateFileStatus(id, 'uploading');
    for (let p = 0; p <= 100; p += 10) {
      await new Promise(r => setTimeout(r, 50));
      updateFileProgress(id, p);
    }
    updateFileStatus(id, 'complete');
  }, [addFile, updateFileStatus, updateFileProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(processFile);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(processFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [processFile]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`upload-zone relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'dragging border-emerald-400 bg-emerald-500/5'
            : 'border-white/10 hover:border-indigo-400/40 bg-white/[0.02]'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          onChange={handleFileSelect}
        />

        <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
            <Upload className={`w-7 h-7 transition-colors ${isDragging ? 'text-emerald-400' : 'text-indigo-400'}`} />
          </div>
          <p className="text-base font-semibold text-slate-200 mb-1">
            {isDragging ? 'Drop your files here' : 'Drag & drop exam papers'}
          </p>
          <p className="text-sm text-slate-400 mb-3">or click to browse files</p>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><FileImage className="w-3.5 h-3.5" /> JPG, PNG</span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> PDF</span>
            <span className="w-px h-3 bg-slate-700" />
            <span>Max 10MB</span>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 stagger-children">
          {files.map((f) => (
            <div
              key={f.id}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 group"
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                f.status === 'error' ? 'bg-rose-500/15' : 
                f.status === 'complete' ? 'bg-emerald-500/15' : 'bg-indigo-500/15'
              }`}>
                {f.type === 'application/pdf' ? (
                  <FileText className={`w-4 h-4 ${f.status === 'error' ? 'text-rose-400' : 'text-indigo-400'}`} />
                ) : (
                  <FileImage className={`w-4 h-4 ${f.status === 'error' ? 'text-rose-400' : 'text-indigo-400'}`} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{f.name}</p>
                <p className="text-xs text-slate-500">{formatSize(f.size)}</p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 shrink-0">
                {f.status === 'uploading' && (
                  <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
                {f.status === 'complete' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />}
                {f.status === 'error' && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs text-rose-400 max-w-[120px] truncate">{f.error}</span>
                  </div>
                )}
              </div>

              {/* Remove */}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
