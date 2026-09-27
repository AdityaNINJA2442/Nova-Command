import React, { useState } from 'react';
import {
  CalendarRange,
  Clock,
  AlertTriangle,
  ShieldCheck,
  GitFork,
  RefreshCw,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';

export const ProductionPlanning: React.FC = () => {
  const {
    operations,
    machines,
    orders,
    rerouteOperation,
    setActiveTab,
    setSelectedOrderId,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [selectedOpFilter, setSelectedOpFilter] = useState<'all' | 'delayed' | 'in_progress'>('all');

  const op27 = operations.find((o) => o.id === 'OP-27');
  const isRerouted = op27?.machineId === 'M-006';

  const delayedOps = operations.filter((o) => o.delayHours > 0 || o.status === 'delayed' || o.status === 'blocked');
  const affectedOrders = orders.filter((o) => o.deliveryRisk === 'high');

  const filteredOps = operations.filter((op) => {
    if (selectedOpFilter === 'delayed') return op.delayHours > 0 || op.status === 'delayed';
    if (selectedOpFilter === 'in_progress') return op.status === 'in_progress';
    return true;
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CalendarRange className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Production Planning & Capacity Gantt
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Dynamic scheduling, machine bottlenecks, dependency graphs, and automated consequence propagation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('what-if')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <GitFork className="h-4 w-4" />
            <span>Simulate Schedule Optimization</span>
          </button>
        </div>
      </div>

      {/* DISRUPTION CASCADE ALERT BANNER */}
      {!isRerouted && delayedOps.length > 0 && (
        <div
          className="rounded-xl p-4 border shadow-sm"
          style={{
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.45)' : '#FECACA',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0 border border-rose-500/40">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Schedule Disruption Cascade Detected on Line 2
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-400 dark:border-rose-700">
                    {delayedOps.length} Operations Affected · {affectedOrders.length} Customer Orders At Risk
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-100/80 mt-1 max-w-2xl leading-relaxed">
                  Machine M-004 vibration anomaly throttled operation <strong>OP-27</strong> by 5.5 hours. Downstream operation <strong>OP-28</strong> is blocked in queue. Customer orders <strong>ORDER-1042</strong> and <strong>ORDER-1048</strong> have delivery buffers collapsed under SLA limits.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => rerouteOperation('OP-27', 'M-006')}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reroute OP-27 to Standby M-006</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* When Rerouted / Mitigated Banner */}
      {isRerouted && (
        <div
          className="rounded-xl p-4 border shadow-sm flex items-center justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#F0FDF4',
            borderColor: isDark ? 'rgba(34, 197, 94, 0.4)' : '#BBF7D0',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Schedule Bottleneck Resolved: OP-27 Active on Standby Cell M-006
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Mazak 5-Axis cell absorbed workload. ORDER-1042 delivery risk restored to Low (100% on-time).
              </p>
            </div>
          </div>
          <button
            onClick={() => rerouteOperation('OP-27', 'M-004')}
            className="text-xs hover:underline cursor-pointer font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            Revert to M-004
          </button>
        </div>
      )}

      {/* Production Timeline & Machine Capacity Gantt */}
      <div
        className="rounded-xl p-4 space-y-4 border shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Machine Capacity & Schedule Gantt (Shift A · 06:00 - 14:00)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
              <span>Delayed / Throttled</span>
            </div>
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
              <span>Blocked</span>
            </div>
          </div>
        </div>

        {/* Gantt Matrix */}
        <div className="space-y-3">
          {machines.map((machine) => {
            const assignedOps = operations.filter((o) => o.machineId === machine.id);
            const isStandbyM6 = machine.id === 'M-006';

            return (
              <div
                key={machine.id}
                className="p-3 rounded-lg border shadow-xs"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{machine.id}</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>({machine.name.split(' ')[0]})</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{machine.line.split('-')[0]}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Utilization: <strong style={{ color: 'var(--text-primary)' }}>{machine.utilization}%</strong>
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        machine.status === 'running'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                          : machine.status === 'maintenance'
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {machine.status}
                    </span>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div
                  className="w-full h-8 rounded-lg border flex items-center p-1 relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {assignedOps.length === 0 ? (
                    <div className="text-[11px] italic pl-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span>Standby capacity available (15% base idle load)</span>
                      {isStandbyM6 && !isRerouted && (
                        <button
                          onClick={() => rerouteOperation('OP-27', 'M-006')}
                          className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold underline cursor-pointer"
                        >
                          Assign Rerouted OP-27 here
                        </button>
                      )}
                    </div>
                  ) : (
                    assignedOps.map((op) => {
                      const isDelayed = op.delayHours > 0 || op.status === 'delayed';
                      const isBlocked = op.status === 'blocked';

                      return (
                        <div
                          key={op.id}
                          className="h-full rounded flex items-center justify-between px-2 text-[11px] font-medium mr-1.5 transition-all cursor-pointer shadow-xs border"
                          style={{
                            width: `${Math.max(25, (op.durationHours / 12) * 100)}%`,
                            backgroundColor: isBlocked
                              ? isDark ? 'rgba(239, 68, 68, 0.4)' : '#FEE2E2'
                              : isDelayed
                              ? isDark ? 'rgba(245, 158, 11, 0.4)' : '#FEF3C7'
                              : op.status === 'in_progress'
                              ? isDark ? 'rgba(34, 197, 94, 0.3)' : '#DCFCE7'
                              : isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                            borderColor: isBlocked
                              ? '#EF4444'
                              : isDelayed
                              ? '#F59E0B'
                              : op.status === 'in_progress'
                              ? '#22C55E'
                              : '#3B82F6',
                            color: isBlocked
                              ? isDark ? '#FCA5A5' : '#991B1B'
                              : isDelayed
                              ? isDark ? '#FDE68A' : '#92400E'
                              : op.status === 'in_progress'
                              ? isDark ? '#86EFAC' : '#166534'
                              : isDark ? '#93C5FD' : '#1E40AF',
                          }}
                          title={`${op.id}: ${op.name} (${op.status})`}
                        >
                          <span className="font-bold truncate">{op.id}: {op.name.split(' ')[0]}</span>
                          <span className="text-[10px] font-mono ml-1 shrink-0 font-bold">
                            {isDelayed ? `+${op.delayHours}h` : `${op.progressPct}%`}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operations Table */}
      <div
        className="border rounded-xl overflow-hidden shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Active Production Operations Register
          </h3>
          <div className="flex items-center gap-2 text-xs">
            {(['all', 'delayed', 'in_progress'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedOpFilter(filter)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer border font-semibold ${
                  selectedOpFilter === filter
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: selectedOpFilter === filter ? undefined : 'var(--surface-secondary)',
                  borderColor: selectedOpFilter === filter ? undefined : 'var(--border)',
                  color: selectedOpFilter === filter ? undefined : 'var(--text-secondary)',
                }}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className="border-b uppercase text-[10px] tracking-wider font-bold"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <tr>
                <th className="py-2.5 px-4">Operation ID / Task</th>
                <th className="py-2.5 px-4">Customer Order</th>
                <th className="py-2.5 px-4">Machine Assigned</th>
                <th className="py-2.5 px-4">Schedule Window</th>
                <th className="py-2.5 px-4">Status & Delay</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredOps.map((op) => {
                const order = orders.find((o) => o.id === op.orderId);
                const isDelayed = op.delayHours > 0 || op.status === 'delayed' || op.status === 'blocked';

                return (
                  <tr
                    key={op.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{op.id}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{op.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedOrderId(op.orderId);
                          setActiveTab('orders');
                        }}
                        className="text-left hover:underline cursor-pointer"
                      >
                        <div className="font-semibold text-blue-600 dark:text-cyan-400">{op.orderId}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{order?.customer}</div>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{op.machineId}</div>
                      {op.alternativeMachineId && (
                        <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">
                          Alt: {op.alternativeMachineId} (Standby)
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      <div>Start: {new Date(op.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div>Duration: {op.durationHours} hrs</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          op.status === 'blocked'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            : isDelayed
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {op.status.replace('_', ' ')} {op.delayHours > 0 && `(+${op.delayHours}h)`}
                      </span>
                      {op.delayReason && (
                        <div className="text-[10px] font-medium text-amber-700 dark:text-amber-400 mt-1 max-w-xs leading-tight">
                          {op.delayReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {op.id === 'OP-27' && op.machineId === 'M-004' ? (
                        <button
                          onClick={() => rerouteOperation('OP-27', 'M-006')}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                        >
                          Reroute to M-006
                        </button>
                      ) : op.id === 'OP-27' && op.machineId === 'M-006' ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Rerouted</span>
                      ) : (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Nominal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
