import React, { useState } from 'react';
import {
  GitFork,
  Play,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { formatCurrency } from '../../services/currency';

export const WhatIfSimulator: React.FC = () => {
  const {
    whatIfScenario,
    simulateWhatIf,
    commitProposedPlan,
    committedPlanVersion,
    setActiveTab,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [scenarioType, setScenarioType] = useState<string>('m4_reroute_m6');
  const [downtimeHours, setDowntimeHours] = useState<number>(6.5);
  const [rerouteTarget, setRerouteTarget] = useState<string>('M-006');
  const [expediteSparePart, setExpediteSparePart] = useState<boolean>(true);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [showCommitSuccess, setShowCommitSuccess] = useState<boolean>(false);

  const current = whatIfScenario.currentMetrics;
  const simulated = whatIfScenario.simulatedMetrics;

  const handleRunSimulation = () => {
    simulateWhatIf({
      downtimeHours,
      rerouteToMachineId: rerouteTarget,
      expediteSparePart,
    });
  };

  const handleCommit = () => {
    setIsCommitting(true);
    setTimeout(() => {
      commitProposedPlan();
      setIsCommitting(false);
      setShowCommitSuccess(true);
      setTimeout(() => setShowCommitSuccess(false), 5000);
    }, 400);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <GitFork className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
              What If Simulator
            </h2>
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--info-bg)',
                color: 'var(--info-text)',
                borderColor: 'var(--border)',
              }}
            >
              SANDBOX SIMULATION ENGINE
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Test operational changes before committing them. Isolated sandbox leaves live factory plan untouched until explicit approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Active Baseline: <strong style={{ color: 'var(--text-primary)' }}>Plan V{committedPlanVersion}.0</strong>
          </span>
        </div>
      </div>

      {/* Commit Success Notification */}
      {showCommitSuccess && (
        <div
          className="p-4 rounded-xl border flex items-center justify-between text-xs shadow-md"
          style={{
            backgroundColor: 'var(--success-bg)',
            borderColor: 'var(--border)',
            color: 'var(--success-text)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Proposed Plan Successfully Committed! (Plan V{committedPlanVersion}.0)
              </div>
              <p className="text-[11px] mt-0.5 opacity-90">
                Operation OP-27 rerouted to Standby Cell M-006. M-004 taken offline for WO-204 bearing overhaul. Customer orders restored to 100% on-time delivery.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('command-center')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shrink-0 shadow-xs"
          >
            View Command Center
          </button>
        </div>
      )}

      {/* Scenario Control Form */}
      <div
        className="rounded-xl p-4 space-y-4 border shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            Configure Simulation Scenario
          </h3>
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Isolated Predictive Sandbox</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block mb-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>Scenario Template</label>
            <select
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value)}
              className="w-full p-2 rounded-lg border font-medium"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="m4_reroute_m6">M-004 Bearing Overhaul + Reroute to M-006</option>
              <option value="m4_shutdown_only">M-004 Immediate Shutdown (No Reroute)</option>
              <option value="urgent_order">Urgent Boeing Order Added (500 units)</option>
              <option value="supplier_delay">Supplier Customs Delay (+3 days on MAT-021)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>M-004 Maintenance Window</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="2"
                max="16"
                step="0.5"
                value={downtimeHours}
                onChange={(e) => setDowntimeHours(Number(e.target.value))}
                className="w-full"
              />
              <span className="font-mono font-bold w-12 text-right" style={{ color: 'var(--text-primary)' }}>
                {downtimeHours}h
              </span>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>Alternative Standby Cell</label>
            <select
              value={rerouteTarget}
              onChange={(e) => setRerouteTarget(e.target.value)}
              className="w-full p-2 rounded-lg border font-medium"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="M-006">M-006 (Mazak 5-Axis Standby - 15% util)</option>
              <option value="none">None (Accept production loss)</option>
              <option value="M-001">M-001 (Hermle 5-Axis - 94% util)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>Spare Part Logistics</label>
            <div className="flex items-center gap-2 pt-1.5">
              <input
                type="checkbox"
                id="expedite"
                checked={expediteSparePart}
                onChange={(e) => setExpediteSparePart(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 h-4 w-4"
              />
              <label htmlFor="expedite" className="cursor-pointer font-medium" style={{ color: 'var(--text-primary)' }}>
                Issue SP-104 Bearing from stock
              </label>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Clicking <strong>Run Simulation</strong> executes discrete-event propagation in memory without changing the live database.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunSimulation}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Run Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* IMPACT CHAIN VISUALIZATION */}
      <div
        className="rounded-xl p-4 border shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
          Simulated Consequence Chain Propagation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          {whatIfScenario.impactChain.map((chain, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border text-xs space-y-1 relative shadow-xs"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                {chain.stage}
              </div>
              <p className="leading-tight font-medium" style={{ color: 'var(--text-primary)' }}>{chain.description}</p>
              {idx < whatIfScenario.impactChain.length - 1 && (
                <ArrowRight
                  className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                  style={{ color: 'var(--text-muted)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SIDE-BY-SIDE COMPARISON: CURRENT PLAN vs PROPOSED PLAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CURRENT COMMITTED PLAN */}
        <div
          className="rounded-xl p-5 space-y-4 border shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Baseline Plan
              </span>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Current Committed State (V{committedPlanVersion}.0)
              </h3>
            </div>
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              Live Plan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Production Output</span>
              <div className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {current.productionOutputUnits} units
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target: 450</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Plant OEE</span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                {current.oeePct}%
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sub-optimal</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Orders At Delivery Risk</span>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
                {current.ordersAtRisk} Orders
              </div>
              <span className="text-[10px] text-rose-500 font-semibold">ORDER-1042 / 1048</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>On-Time Delivery Rate</span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                {current.onTimeDeliveryPct}%
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>SLA breached</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Machine Availability</span>
              <div className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {current.machineAvailabilityPct}%
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>M-004 throttled</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Shift Cost / Penalties</span>
              <div className="text-lg font-bold font-mono mt-1" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(current.totalCostUsd)}
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Includes late penalties</span>
            </div>
          </div>
        </div>

        {/* PROPOSED WHAT-IF PLAN */}
        <div
          className="rounded-xl p-5 space-y-4 border shadow-md relative"
          style={{
            backgroundColor: isDark ? '#111927' : '#FFFFFF',
            borderColor: isDark ? 'rgba(56, 189, 248, 0.4)' : '#93C5FD',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Simulation Candidate
              </span>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Proposed Optimized Schedule
              </h3>
            </div>
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--info-bg)',
                borderColor: 'var(--border)',
                color: 'var(--info-text)',
              }}
            >
              Tested Proposal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Production Output</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {simulated.productionOutputUnits} units
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{simulated.productionOutputUnits - current.productionOutputUnits}
                </span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Capacity recovered</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Plant OEE</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {simulated.oeePct}%
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{(simulated.oeePct - current.oeePct).toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target met</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Orders At Delivery Risk</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {simulated.ordersAtRisk} Orders
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <ShieldCheck className="h-3 w-3 mr-0.5" />
                  0 Risk
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% on-time</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>On-Time Delivery Rate</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {simulated.onTimeDeliveryPct}%
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{(simulated.onTimeDeliveryPct - current.onTimeDeliveryPct).toFixed(0)}%
                </span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Full SLA buffer</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Machine Availability</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {simulated.machineAvailabilityPct}%
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  +{(simulated.machineAvailabilityPct - current.machineAvailabilityPct).toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Standby cell active</span>
            </div>

            <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Shift Cost / Penalties</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(simulated.totalCostUsd)}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                  -{formatCurrency(current.totalCostUsd - simulated.totalCostUsd)}
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {formatCurrency(current.totalCostUsd - simulated.totalCostUsd)} Net Savings
              </span>
            </div>
          </div>

          {/* EXPLICIT MANAGER COMMIT BUTTONS */}
          <div
            className="p-3.5 rounded-lg border space-y-2"
            style={{
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#F0F9FF',
              borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#BAE6FD',
            }}
          >
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              <strong>Manager Approval Required:</strong> Committing this plan will immediately update the live production schedule, reassign OP-27 to M-006, take M-004 into maintenance, and propagate risk clearance across the executive dashboard.
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleCommit}
                disabled={isCommitting}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{isCommitting ? 'Committing Plan...' : 'Commit Proposed Plan to Live Shop Floor'}</span>
              </button>
              <button
                onClick={() => {
                  setDowntimeHours(6.5);
                  setRerouteTarget('M-006');
                  simulateWhatIf({ downtimeHours: 6.5, rerouteToMachineId: 'M-006' });
                }}
                className="py-2.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
