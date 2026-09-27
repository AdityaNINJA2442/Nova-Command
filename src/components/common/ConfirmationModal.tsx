import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  consequences: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  consequences,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{
              backgroundColor: isDangerous
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(56, 189, 248, 0.15)',
              color: isDangerous ? 'var(--critical)' : 'var(--accent)',
            }}
          >
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>
          </div>
        </div>

        {consequences.length > 0 && (
          <div
            className="p-3 rounded-xl border text-xs space-y-1.5"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="font-bold text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              This action will automatically:
            </div>
            <ul className="space-y-1">
              {consequences.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span className="font-bold text-blue-600 dark:text-cyan-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-lg text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              isDangerous ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <Check className="h-4 w-4" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
