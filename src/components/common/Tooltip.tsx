import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  term?: string;
  definition: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, definition, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      role="tooltip"
    >
      {children || (
        <span className="inline-flex items-center gap-0.5 border-b border-dotted border-current">
          {term}
          <HelpCircle className="h-3 w-3 opacity-60 inline" />
        </span>
      )}

      {isVisible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 p-2.5 rounded-lg text-xs font-normal shadow-xl z-50 pointer-events-none transition-all duration-150 border leading-relaxed text-left"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {term && <div className="font-bold mb-0.5" style={{ color: 'var(--accent)' }}>{term}</div>}
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{definition}</div>
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"
            style={{ borderTopColor: 'var(--border)' }}
          />
        </div>
      )}
    </span>
  );
};

export const COMMON_DEFINITIONS = {
  OEE: 'Overall Equipment Effectiveness — A standard metric measuring the percentage of manufacturing time that is truly productive (Availability × Performance × Quality).',
  Vibration: 'Spindle Bearing Vibration — Measured in mm/s RMS. Elevated vibration indicates mechanical wear, bearing cage failure, or tool chatter.',
  DaysOfCover: 'Days of Cover — The estimated number of days current stock will last based on planned consumption rates before running out.',
  PPM: 'Parts Per Million — Defective units per 1,000,000 produced. Used for high-precision quality benchmarking.',
  SPC: 'Statistical Process Control — Mathematical technique using control limits (UCL/LCL) to detect abnormal manufacturing process variation before defects occur.',
  MTBF: 'Mean Time Between Failures — Average operating hours between unexpected machine breakdowns.',
  MTTR: 'Mean Time to Repair — Average hours required to troubleshoot and restore a machine to production.',
};
