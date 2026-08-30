import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from './Toast';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
  notify?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className = '', label = 'Copy', notify = true }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (notify) toast({ title: 'Copied to clipboard', variant: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({ title: 'Could not copy', description: 'Your browser blocked clipboard access.', variant: 'error' });
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
        copied
          ? 'bg-success/10 text-success border-success/30'
          : 'bg-muted text-foreground/80 border-border hover:bg-muted hover:border-input hover:text-foreground'
      } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
