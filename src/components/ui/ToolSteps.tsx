import React from 'react';
import { Stepper, type Step } from './Stepper';

/**
 * Where a file tool is in its work.
 *
 * `configure` covers everything between having a file and having a result —
 * cropping, setting a quality, picking columns — which is why the middle step
 * is labelled per tool rather than globally.
 */
export type ToolPhase = 'upload' | 'configure' | 'done';

const PHASE_INDEX: Record<ToolPhase, number> = { upload: 0, configure: 1, done: 2 };

interface ToolStepsProps {
  phase: ToolPhase;
  /** Middle step label, e.g. "Crop", "Quality", "Columns". */
  middleLabel?: string;
  className?: string;
}

/**
 * The three-step rail shown above a file tool: Upload → <work> → Download.
 *
 * File tools each own their state, so the phase is passed in rather than
 * inferred. Multi-step file conversions that run through ConversionFlow use
 * their own four-step rail (it has a distinct Convert step); this is for the
 * tools that transform in place and hand back a download.
 */
export const ToolSteps: React.FC<ToolStepsProps> = ({ phase, middleLabel = 'Adjust', className = '' }) => {
  const steps: Step[] = [
    { id: 'upload', label: 'Upload' },
    { id: 'adjust', label: middleLabel },
    { id: 'download', label: 'Download' },
  ];
  return <Stepper steps={steps} current={PHASE_INDEX[phase]} className={className} />;
};
