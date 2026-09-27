import React from 'react';
import {
  BarChart3,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { formatCurrency } from '../../services/currency';

export const Analytics: React.FC = () => {
  const { machines } = useManufacturingStore();
  const { isDark } = useTheme();

  const costBreakdown = [
    { category: 'Direct Labor & Overtime', amountUsd: 28400, pct: 33.5, color: isDark ? 'bg-blue-500' : 'bg-blue-600' },
    { category: 'Raw Materials & Components', amountUsd: 32600, pct: 38.5, color: isDark ? 'bg-cyan-500' : 'bg-cyan-600' },
    { category: 'Maintenance & Overhauls', amountUsd: 11200, pct: 13.2, color: isDark ? 'bg-amber-500' : 'bg-amber-600' },
    { category: 'Scrap & Non-Conformance', amountUsd: 5800, pct: 6.9, color: isDark ? 'bg-rose-500' : 'bg-rose-600' },
    { category: 'Contractual SLA Penalties', amountUsd: 6600, pct: 7.9, color: isDark ? 'bg-purple-500' : 'bg-purple-600' },
  ];

  const totalCost = costBreakdown.reduce((sum, c) => sum + c.amountUsd, 0);

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Executive Operational Analytics & Cost Rollup
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive financial breakdown, MTBF/MTTR trends, OEE performance, and delivery variance
          </p>
        </div>

        <div
          className="flex items-center gap-2 text-xs border px-3 py-1.5 rounded-lg shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Total Shift Cost: </span>
          <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(totalCost)}
          </span>
        </div>
      </div>

      {/* Top Analytics KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border p-3.5 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Plant Mean Time Between Failures</span>
          <div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>340 hrs</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+18h vs last quarter</span>
        </div>

        <div className="border p-3.5 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Mean Time to Repair (MTTR)</span>
          <div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>4.2 hrs</div>
          <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">-0.6h target efficiency</span>
        </div>

        <div className="border p-3.5 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Scrap Rate</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">1.8%</div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target: &lt;2.0%</span>
        </div>

        <div className="border p-3.5 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Average Energy Efficiency</span>
          <div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>0.42 kWh/unit</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Class A Eco rating</span>
        </div>
      </div>

      {/* Cost Breakdown & Downtime Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cost Category Breakdown */}
        <div
          className="rounded-xl p-4 space-y-4 border shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Shift Operational Cost Breakdown
            </h3>
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Total: {formatCurrency(totalCost)}</span>
          </div>

          {/* Stacked bar visualization */}
          <div className="w-full h-3 rounded-full flex overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            {costBreakdown.map((item, idx) => (
              <div
                key={idx}
                className={`${item.color} h-full`}
                style={{ width: `${item.pct}%` }}
                title={`${item.category}: ${formatCurrency(item.amountUsd)}`}
              />
            ))}
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {costBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(item.amountUsd)}
                  </span>
                  <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Machine Downtime Distribution */}
        <div
          className="rounded-xl p-4 space-y-4 border shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Cumulative Machine Downtime (Month-to-Date)
            </h3>
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Hours by Cell</span>
          </div>

          <div className="space-y-3 text-xs">
            {machines.map((m) => {
              const maxDowntime = 30;
              const barWidth = Math.min(100, (m.downtimeHours / maxDowntime) * 100);
              const isHigh = m.downtimeHours > 15;

              return (
                <div key={m.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {m.id} · {m.name.split(' ')[0]}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isHigh ? 'text-amber-600 dark:text-amber-400' : ''
                      }`}
                      style={{ color: isHigh ? undefined : 'var(--text-primary)' }}
                    >
                      {m.downtimeHours} hrs
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="p-3 rounded-lg border text-[11px] leading-relaxed"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <strong>Root Cause Analysis:</strong> Machine M-004 accounts for 48% of cell downtime due to progressive spindle bearing degradation. Overhaul WO-204 resets this failure rate to nominal baseline.
          </div>
        </div>
      </div>
    </div>
  );
};
