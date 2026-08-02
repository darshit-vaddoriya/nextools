import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileDropWrapperProps {
  onFiles: (files: File[]) => void;
  overlayText?: string;
  className?: string;
  children: React.ReactNode;
}

export const FileDropWrapper: React.FC<FileDropWrapperProps> = ({
  onFiles,
  overlayText = 'Drop files here',
  className = '',
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setIsDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(files);
      }}
    >
      {children}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-indigo-500 bg-indigo-500/[0.08] backdrop-blur-[2px] pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
            <Upload className="w-6 h-6" />
            {overlayText}
          </div>
        </div>
      )}
    </div>
  );
};
