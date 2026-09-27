import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { Alert } from '../../types';

interface AlertCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ isOpen, onClose }) => {
  const {
    alerts,
    updateAlertStatus,
    setActiveTab,
    setSelectedMachineId,
    setSelectedOrderId,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [filterPriority, setFilterPriority] = useState<string>('all');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filterPriority === 'all') return true;
    return a.priority === filterPriority;
  });

  const getPriorityStyle = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical':
        return isDark
          ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
          : 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return isDark
          ? 'bg-amber-950 text-amber-300 border-amber-800'
          : 'bg-amber-100 text-amber-800 border-amber-300';
      case 'medium':
        return isDark
          ? 'bg-blue-950 text-blue-300 border-blue-800'
          : 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    }
  };

  const handleOpenModule = (alert: Alert) => {
    onClose();
    if (alert.relatedModule === 'machines' && alert.targetId) {
      setSelectedMachineId(alert.targetId);
      setActiveTab('machines');
    } else if (alert.relatedModule === 'orders' && alert.targetId) {
      setSelectedOrderId(alert.targetId);
      setActiveTab('orders');
    } else {
      setActiveTab(alert.relatedModule);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="border rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Priority Alert Center</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Action-oriented alert routing by impact, ownership, and subsystem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-75 cursor-pointer text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b text-xs"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Filter:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer border font-semibold ${
                filterPriority === p
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{
                backgroundColor: filterPriority === p ? undefined : 'var(--card)',
                borderColor: filterPriority === p ? undefined : 'var(--border)',
                color: filterPriority === p ? undefined : 'var(--text-secondary)',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl border transition-all text-xs shadow-xs"
              style={{
                backgroundColor: alert.status === 'resolved'
                  ? isDark ? 'rgba(30, 41, 59, 0.4)' : '#F8FAFC'
                  : alert.priority === 'critical'
                  ? isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2'
                  : 'var(--surface-secondary)',
                borderColor: alert.priority === 'critical' && alert.status !== 'resolved'
                  ? isDark ? 'rgba(239, 68, 68, 0.4)' : '#FECACA'
                  : 'var(--border)',
                opacity: alert.status === 'resolved' ? 0.7 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityStyle(alert.priority)}`}>
                    {alert.priority}
                  </span>
                  <span className="font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{alert.id}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>· {alert.relatedModule}</span>
                </div>
                <span
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: alert.status === 'resolved'
                      ? 'var(--success-bg)'
                      : 'var(--card)',
                    color: alert.status === 'resolved'
                      ? 'var(--success-text)'
                      : 'var(--text-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {alert.status}
                </span>
              </div>

              <div className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{alert.issue}</div>

              <div className="space-y-1 text-[11px] mb-3" style={{ color: 'var(--text-secondary)' }}>
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Impact: </span>
                  {alert.impact}
                </div>
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Designated Owner: </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{alert.owner}</span>
                </div>
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recommended Action: </span>
                  <span className="text-blue-600 dark:text-cyan-400 font-semibold">{alert.recommendedAction}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => handleOpenModule(alert)}
                  className="text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Open {alert.relatedModule}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>

                <div className="flex items-center gap-2">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                      className="px-2.5 py-1 rounded border font-semibold cursor-pointer shadow-xs"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'resolved')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Check className="h-3 w-3" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
