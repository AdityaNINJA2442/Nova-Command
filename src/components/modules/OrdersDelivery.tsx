import React from 'react';
import {
  PackageCheck,
  AlertTriangle,
  ShieldCheck,
  GitFork,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { Order } from '../../types';
import { formatCurrency } from '../../services/currency';

export const OrdersDelivery: React.FC = () => {
  const {
    orders,
    machines,
    operations,
    selectedOrderId,
    setSelectedOrderId,
    setActiveTab,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
  const activeOp = operations.find((o) => o.id === selectedOrder.currentOperationId);
  const activeMachine = machines.find((m) => m.id === activeOp?.machineId);

  const highRiskCount = orders.filter((o) => o.deliveryRisk === 'high').length;
  const totalPipelineVal = orders.reduce((sum, o) => sum + o.valueUsd, 0);
  const atRiskVal = orders.filter((o) => o.deliveryRisk === 'high').reduce((sum, o) => sum + o.valueUsd, 0);

  const getRiskBadge = (risk: Order['deliveryRisk']) => {
    switch (risk) {
      case 'high':
        return isDark
          ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
          : 'bg-rose-100 text-rose-800 border-rose-300';
      case 'medium':
        return isDark
          ? 'bg-amber-950 text-amber-300 border-amber-800'
          : 'bg-amber-100 text-amber-800 border-amber-300';
      case 'low':
      default:
        return isDark
          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <PackageCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Orders & On-Time Delivery Risk
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Real-time delivery risk scoring derived from machine availability, operation bottlenecks, and material readiness
          </p>
        </div>

        <div
          className="flex items-center gap-3 text-xs border px-3 py-1.5 rounded-lg shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Pipeline Value: </span>
            <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalPipelineVal)}
            </span>
          </div>
          <span style={{ color: 'var(--border)' }}>|</span>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Value at Late Risk: </span>
            <span
              className="font-bold font-mono"
              style={{
                color: highRiskCount > 0 ? 'var(--critical)' : 'var(--success)',
              }}
            >
              {formatCurrency(atRiskVal)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Orders Book */}
        <div className="lg:col-span-2 space-y-3">
          {orders.map((order) => {
            const isSelected = order.id === selectedOrder.id;
            const isHighRisk = order.deliveryRisk === 'high';

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-400'
                }`}
                style={{
                  backgroundColor: isHighRisk
                    ? isDark
                      ? 'rgba(239, 68, 68, 0.12)'
                      : '#FEF2F2'
                    : 'var(--card)',
                  borderColor: isHighRisk
                    ? isDark
                      ? 'rgba(239, 68, 68, 0.4)'
                      : '#FECACA'
                    : 'var(--border)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{order.id}</span>
                    <span className="text-xs font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
                      {order.customer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(order.valueUsd)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRiskBadge(order.deliveryRisk)}`}>
                      {order.deliveryRisk} Risk
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div>
                    <span>Product:</span>
                    <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{order.product}</div>
                  </div>
                  <div>
                    <span>Batch Quantity:</span>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{order.quantity} units</div>
                  </div>
                  <div>
                    <span>Due Date:</span>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {new Date(order.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <span>Machine Status:</span>
                    <div
                      className={`font-bold capitalize ${
                        order.machineReadiness === 'blocked'
                          ? 'text-rose-600 dark:text-rose-400'
                          : order.machineReadiness === 'at_risk'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {order.machineReadiness}
                    </div>
                  </div>
                </div>

                {/* Primary Risk Warning Tag */}
                {order.riskReasons.length > 0 && isHighRisk && (
                  <div
                    className="mt-2.5 p-2 rounded border text-[11px] flex items-center justify-between"
                    style={{
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#FCA5A5',
                      color: isDark ? '#FCA5A5' : '#991B1B',
                    }}
                  >
                    <span className="truncate">{order.riskReasons[0]}</span>
                    <span className="text-[10px] font-bold underline shrink-0 ml-2">
                      Inspect Root Cause →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: "WHY IS IT AT RISK" Detail Panel */}
        <div
          className="rounded-xl p-5 space-y-4 border shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{selectedOrder.id}</span>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedOrder.customer}</p>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRiskBadge(selectedOrder.deliveryRisk)}`}>
              {selectedOrder.deliveryRisk} Delivery Risk
            </span>
          </div>

          {/* Root Cause Explanation Header */}
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: 'var(--text-primary)' }}>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Root Cause Risk Breakdown
            </h3>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Why this order has a <strong>{selectedOrder.deliveryRisk.toUpperCase()}</strong> risk classification:
            </p>
            <ul className="space-y-1.5 text-xs">
              {selectedOrder.riskReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">•</span>
                  <span style={{ color: 'var(--text-primary)' }}>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connected Dependencies */}
          <div className="space-y-2 text-xs">
            <div
              className="p-2.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Current Operation Dependency
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{activeOp?.id || 'None'}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{activeOp?.name}</span>
              </div>
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                Delay: +{activeOp?.delayHours || 0} hours
              </div>
            </div>

            <div
              className="p-2.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Machine Dependency
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{activeMachine?.id || 'M-004'}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                    activeMachine?.status === 'running'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  {activeMachine?.status || 'Warning'}
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
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Contractual Financial Impact
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span style={{ color: 'var(--text-secondary)' }}>Contract Value:</span>
                <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(selectedOrder.valueUsd)}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-rose-600 dark:text-rose-400">
                <span>Late Penalty:</span>
                <span className="font-bold font-mono">{formatCurrency(selectedOrder.penaltyPerDayUsd)} / day</span>
              </div>
            </div>
          </div>

          {/* Simulator CTA */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setActiveTab('what-if')}
              className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <GitFork className="h-4 w-4" />
              <span>Simulate Mitigation in What-If Engine</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
