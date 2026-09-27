import React from 'react';
import {
  Factory,
  Wrench,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { Machine } from '../../types';

export const FactoryFloor: React.FC = () => {
  const {
    machines,
    operations,
    orders,
    selectedMachineId,
    setSelectedMachineId,
    setActiveTab,
    createWorkOrder,
    completeWorkOrder,
    workOrders,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const activeOp = operations.find((o) => o.id === selectedMachine.currentOperationId);
  const activeOrder = orders.find((o) => o.id === selectedMachine.currentOrderId);
  const activeWO = workOrders.find((w) => w.machineId === selectedMachine.id && w.status !== 'completed');

  const lines = [
    {
      id: 'line-1',
      name: 'Line 1 - High-Precision Milling',
      description: 'Aerospace structural components & turbine housings',
      machineIds: ['M-001', 'M-002'],
      status: 'nominal',
    },
    {
      id: 'line-2',
      name: 'Line 2 - Stamping & Heavy Fabrication',
      description: 'Multi-spindle machining, dynamic balancing & 500T press cell',
      machineIds: ['M-003', 'M-004', 'M-006'],
      status: machines.some((m) => ['M-003', 'M-004', 'M-006'].includes(m.id) && m.status !== 'running')
        ? 'warning'
        : 'nominal',
    },
    {
      id: 'line-3',
      name: 'Line 3 - Quality Assurance & Metrology',
      description: 'Sub-micron coordinate measuring machines & non-destructive testing',
      machineIds: ['M-005'],
      status: 'nominal',
    },
  ];

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'running':
        return {
          bg: isDark ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4',
          border: isDark ? 'rgba(34, 197, 94, 0.35)' : '#BBF7D0',
          dot: 'bg-emerald-500',
          badge: isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'warning':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
          border: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A',
          dot: 'bg-amber-500 animate-pulse-amber',
          badge: isDark ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'critical':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
          border: isDark ? 'rgba(239, 68, 68, 0.45)' : '#FECACA',
          dot: 'bg-rose-500 animate-pulse-red',
          badge: isDark ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'maintenance':
        return {
          bg: isDark ? 'rgba(100, 116, 139, 0.15)' : '#F1F5F9',
          border: isDark ? 'rgba(100, 116, 139, 0.3)' : '#E2E8F0',
          dot: 'bg-slate-400',
          badge: isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300',
        };
      case 'offline':
      default:
        return {
          bg: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC',
          border: isDark ? 'var(--border)' : '#E2E8F0',
          dot: 'bg-slate-400',
          badge: 'bg-slate-100 text-slate-600 border-slate-300',
        };
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Factory className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Factory Floor Digital Twin
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Interactive physical cell layout, real-time load distribution, and telemetry statuses
          </p>
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-3 text-xs px-3 py-1.5 rounded-lg border shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span style={{ color: 'var(--text-primary)' }}>Running</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span style={{ color: 'var(--text-primary)' }}>Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span style={{ color: 'var(--text-primary)' }}>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span style={{ color: 'var(--text-primary)' }}>In Maintenance</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: 2D Factory Floor Visual Map */}
        <div className="lg:col-span-2 space-y-4">
          {lines.map((line) => (
            <div
              key={line.id}
              className="rounded-xl p-4 border shadow-xs relative overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      line.status === 'nominal' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    {line.name}
                  </h3>
                </div>
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{line.description}</span>
              </div>

              {/* Machine Cards within the Line */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {line.machineIds.map((mId) => {
                  const machine = machines.find((m) => m.id === mId);
                  if (!machine) return null;
                  const style = getStatusColor(machine.status);
                  const isSelected = selectedMachine.id === machine.id;

                  return (
                    <button
                      key={machine.id}
                      onClick={() => setSelectedMachineId(machine.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative shadow-xs ${
                        isSelected
                          ? 'ring-2 ring-blue-500 scale-[1.02]'
                          : 'hover:border-blue-400'
                      }`}
                      style={{
                        backgroundColor: style.bg,
                        borderColor: isSelected ? 'var(--accent)' : style.border,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                          {machine.id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${style.badge}`}>
                          {machine.status}
                        </span>
                      </div>

                      <div className="text-xs font-semibold truncate mb-1" style={{ color: 'var(--text-primary)' }}>
                        {machine.name}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                        <div>
                          <span>Utilization:</span>
                          <span className="font-semibold ml-1" style={{ color: 'var(--text-primary)' }}>
                            {machine.utilization}%
                          </span>
                        </div>
                        <div>
                          <span>Health:</span>
                          <span
                            className={`font-semibold ml-1 ${
                              machine.healthScore < 70 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {machine.healthScore}%
                          </span>
                        </div>
                        <div>
                          <span>Vibration:</span>
                          <span
                            className={`font-mono font-medium ml-1 ${
                              machine.vibration > machine.vibrationThreshold
                                ? 'text-amber-600 dark:text-amber-400 font-bold'
                                : ''
                            }`}
                          >
                            {machine.vibration.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span>Temp:</span>
                          <span className="font-mono ml-1">
                            {machine.temperature.toFixed(0)}°C
                          </span>
                        </div>
                      </div>

                      {machine.currentOperationId && (
                        <div
                          className="mt-2 text-[10px] p-1 rounded border truncate"
                          style={{
                            backgroundColor: 'var(--surface-secondary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          Active: {machine.currentOperationId}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Slide-over Detail Panel */}
        <div
          className="rounded-xl p-5 space-y-4 border shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedMachine.id}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    getStatusColor(selectedMachine.status).badge
                  }`}
                >
                  {selectedMachine.status}
                </span>
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {selectedMachine.name}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedMachineId(selectedMachine.id);
                setActiveTab('machines');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              Full Telemetry <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          {/* Critical Issue Alert Banner if any */}
          {selectedMachine.criticalIssue && (
            <div
              className="p-3 rounded-lg border text-xs leading-relaxed"
              style={{
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FCD34D',
                color: isDark ? '#FDE68A' : '#92400E',
              }}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Simulated Anomaly Notice</span>
              </div>
              <p>{selectedMachine.criticalIssue}</p>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div
              className="p-2.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Vibration (mm/s)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span
                  className={`text-lg font-bold font-mono ${
                    selectedMachine.vibration > selectedMachine.vibrationThreshold
                      ? 'text-amber-600 dark:text-amber-400'
                      : ''
                  }`}
                  style={{ color: selectedMachine.vibration > selectedMachine.vibrationThreshold ? undefined : 'var(--text-primary)' }}
                >
                  {selectedMachine.vibration.toFixed(2)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  Limit: {selectedMachine.vibrationThreshold.toFixed(1)}
                </span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Temperature</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {selectedMachine.temperature.toFixed(1)}°C
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  Nominal: &lt;65°C
                </span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Cell Utilization</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedMachine.utilization}%
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Target: 85%</span>
              </div>
            </div>

            <div
              className="p-2.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Power Consumption</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedMachine.energy} kW
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>3-Phase 400V</span>
              </div>
            </div>
          </div>

          {/* Active Operation & Order */}
          <div className="space-y-2 text-xs pt-1">
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Current Production Assignment
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {activeOp?.id || 'None (Standby)'}
                </span>
                <span className="text-blue-600 dark:text-cyan-400 font-medium">
                  {activeOp?.name || 'Available for Scheduling'}
                </span>
              </div>
              {activeOrder && (
                <div className="mt-2 pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Customer Order:</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {activeOrder.id} ({activeOrder.customer})
                  </span>
                </div>
              )}
            </div>

            {/* Maintenance Work Order Status */}
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Maintenance Work Order
              </span>
              {activeWO ? (
                <div className="mt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 dark:text-amber-300">{activeWO.id}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                      {activeWO.status}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-primary)' }}>{activeWO.issue}</p>
                </div>
              ) : (
                <div className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                  No active work order. Next PM: {selectedMachine.nextScheduledMaintenance}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {selectedMachine.id === 'M-004' && selectedMachine.status !== 'maintenance' && (
              <button
                onClick={() => {
                  createWorkOrder({
                    machineId: 'M-004',
                    issue: 'Corrective spindle overhaul for excessive vibration',
                    priority: 'critical',
                    technicianId: 'EMP-01',
                    technicianName: 'Marcus Vance',
                  });
                  setActiveTab('maintenance');
                }}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Create Maintenance Work Order (WO-204)</span>
              </button>
            )}

            {selectedMachine.status === 'maintenance' && activeWO && (
              <button
                onClick={() => completeWorkOrder(activeWO.id)}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Complete Maintenance & Restore M-004</span>
              </button>
            )}

            <button
              onClick={() => {
                setSelectedMachineId(selectedMachine.id);
                setActiveTab('machines');
              }}
              className="w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <span>Inspect Telemetry & Vibration Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
