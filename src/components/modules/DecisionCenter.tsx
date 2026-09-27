import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  Activity,
  ShieldCheck,
  CheckCircle2,
  GitFork,
  Wrench,
  Layers,
  Cpu,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { DecisionRecommendation } from '../../types';

export const DecisionCenter: React.FC = () => {
  const {
    recommendations,
    setActiveTab,
    setSelectedMachineId,
    commitProposedPlan,
    setToast,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [filterCategory, setFilterCategory] = useState<'all' | 'machine_health' | 'material_shortage'>('all');

  const filteredRecs = recommendations.filter((r) => {
    if (filterCategory === 'all') return true;
    return r.category === filterCategory;
  });

  const getPriorityStyle = (priority: DecisionRecommendation['priority']) => {
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
      default:
        return isDark
          ? 'bg-blue-950 text-blue-300 border-blue-800'
          : 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              AI Decision Center & Explainable Recommendations
            </h2>
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF',
                color: isDark ? '#D8B4FE' : '#7E22CE',
                borderColor: 'var(--border)',
              }}
            >
              EXPLAINABLE AI ENGINE
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Transparent algorithmic reasoning: Every recommendation exposes WHAT, WHY, EVIDENCE, METHOD, and RECOMMENDED ACTION. Zero unexplained black-box scores.
          </p>
        </div>

        <div
          className="flex items-center gap-2 text-xs border px-3 py-1.5 rounded-lg shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Pending Actions: </span>
          <span className="font-bold text-purple-600 dark:text-purple-300">
            {recommendations.filter((r) => r.status === 'pending').length} Actionable Items
          </span>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const isApplied = rec.status === 'applied';

          return (
            <div
              key={rec.id}
              className="rounded-xl border p-5 transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: rec.priority === 'critical' && !isApplied
                  ? isDark ? 'rgba(239, 68, 68, 0.5)' : '#FCA5A5'
                  : 'var(--border)',
              }}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b gap-2" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs border"
                    style={{
                      backgroundColor: isApplied
                        ? isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7'
                        : isDark ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF',
                      color: isApplied ? 'var(--success-text)' : '#9333EA',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {isApplied ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{rec.title}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityStyle(rec.priority)}`}>
                        {rec.priority} Priority
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>· ID: {rec.id}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Target Entities: <strong style={{ color: 'var(--text-primary)' }}>{rec.targetEntity}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isApplied ? (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded border flex items-center gap-1.5"
                      style={{
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success-text)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Plan Committed by Manager
                    </span>
                  ) : (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                        color: isDark ? '#FDE68A' : '#92400E',
                        borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
                      }}
                    >
                      Awaiting Manager Approval
                    </span>
                  )}
                </div>
              </div>

              {/* 5-PART MANDATORY STRUCTURE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. WHAT HAPPENED */}
                <div
                  className="p-3 rounded-lg border shadow-2xs"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-blue-600 dark:text-cyan-400">
                    <Activity className="h-3.5 w-3.5" />
                    1. What Happened
                  </div>
                  <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{rec.what}</p>
                </div>

                {/* 2. WHY IT MATTERS */}
                <div
                  className="p-3 rounded-lg border shadow-2xs"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    2. Why It Matters
                  </div>
                  <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{rec.why}</p>
                </div>

                {/* 3. EVIDENCE */}
                <div
                  className="p-3 rounded-lg border shadow-2xs"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <Layers className="h-3.5 w-3.5" />
                    3. Sensor & Transaction Evidence
                  </div>
                  <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{rec.evidence}</p>
                </div>

                {/* 4. METHOD */}
                <div
                  className="p-3 rounded-lg border shadow-2xs"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <Cpu className="h-3.5 w-3.5" />
                    4. Algorithmic Method
                  </div>
                  <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{rec.method}</p>
                </div>
              </div>

              {/* 5. RECOMMENDED ACTION & IMPACT */}
              <div
                className="mt-4 p-3.5 rounded-lg border text-xs shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : '#F0F9FF',
                  borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : '#BAE6FD',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 flex items-center gap-1">
                    <Wrench className="h-3.5 w-3.5" />
                    5. Recommended Operational Action
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    Impact: {rec.estimatedImpact}
                  </div>
                </div>
                <p className="font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {rec.recommendedAction}
                </p>
              </div>

              {/* Direct Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMachineId('M-004');
                      setActiveTab('machines');
                    }}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>View Evidence Telemetry</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('what-if')}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <GitFork className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>Run in What-If Simulator</span>
                  </button>
                </div>

                {!isApplied && (
                  <button
                    onClick={() => {
                      commitProposedPlan();
                      setToast({
                        text: `Recommendation ${rec.id} executed and committed to plant schedule.`,
                        type: 'success',
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve & Commit Proposed Schedule</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
