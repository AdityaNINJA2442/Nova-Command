import React from 'react';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { PurchaseOrder } from '../../types';
import { formatCurrency } from '../../services/currency';

export const Procurement: React.FC = () => {
  const {
    purchaseOrders,
    updatePurchaseOrderStatus,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const stages = [
    { id: 'requisition', label: '1. Requisition', desc: 'Material demand triggered' },
    { id: 'approved', label: '2. Approval', desc: 'Financial clearance' },
    { id: 'order_placed', label: '3. Purchase Order', desc: 'Dispatched to supplier' },
    { id: 'in_transit', label: '4. Transit & Customs', desc: 'Carrier logistics tracking' },
    { id: 'delivered', label: '5. Goods Receipt', desc: 'Dock QA & stock intake' },
  ];

  const getStatusStageIndex = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'requisition':
        return 0;
      case 'approved':
        return 1;
      case 'order_placed':
        return 2;
      case 'in_transit':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Procurement Pipeline & Supplier Risk
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            End-to-end procurement workflow: Requisition → Approval → PO → Transit → Goods Receipt → Stock Inflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="text-xs border px-3 py-1.5 rounded-lg shadow-xs"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Active Pipeline: </span>
            <span className="font-bold text-blue-600 dark:text-cyan-400">{purchaseOrders.length} Open POs</span>
          </div>
        </div>
      </div>

      {/* Procurement Workflow Visual Pipeline Tracker */}
      <div
        className="rounded-xl p-4 border shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
          Standard Automated Procurement Lifecycle
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className="p-2.5 rounded-lg border relative text-left"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-cyan-400">{stage.label}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{stage.desc}</div>
              {idx < stages.length - 1 && (
                <ArrowRight
                  className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                  style={{ color: 'var(--text-muted)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PO Cards */}
      <div className="space-y-3">
        {purchaseOrders.map((po) => {
          const currentStage = getStatusStageIndex(po.status);
          const isAtRisk = po.risk === 'high' || po.risk === 'medium';

          return (
            <div
              key={po.id}
              className="p-4 rounded-xl border transition-all shadow-xs"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: isAtRisk
                  ? isDark ? 'rgba(245, 158, 11, 0.4)' : '#FCD34D'
                  : 'var(--border)',
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs border"
                    style={{
                      backgroundColor: po.status === 'delivered'
                        ? isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7'
                        : isAtRisk
                        ? isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7'
                        : isDark ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF',
                      color: po.status === 'delivered'
                        ? 'var(--success-text)'
                        : isAtRisk
                        ? 'var(--warning-text)'
                        : 'var(--info-text)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{po.id}</span>
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: po.status === 'delivered'
                            ? isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7'
                            : 'var(--surface-secondary)',
                          color: po.status === 'delivered' ? 'var(--success-text)' : 'var(--text-primary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        {po.status.replace('_', ' ')}
                      </span>
                      {po.risk !== 'low' && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {po.risk} Supplier Risk
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Supplier: <strong style={{ color: 'var(--text-primary)' }}>{po.supplier}</strong>
                    </div>
                  </div>
                </div>

                {/* Status Advancement Actions */}
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  {po.status === 'requisition' && (
                    <button
                      onClick={() => updatePurchaseOrderStatus(po.id, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Approve Requisition
                    </button>
                  )}
                  {po.status === 'approved' && (
                    <button
                      onClick={() => updatePurchaseOrderStatus(po.id, 'order_placed')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Dispatch PO to Vendor
                    </button>
                  )}
                  {po.status === 'order_placed' && (
                    <button
                      onClick={() => updatePurchaseOrderStatus(po.id, 'in_transit')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Confirm Carrier Transit
                    </button>
                  )}
                  {po.status === 'in_transit' && (
                    <button
                      onClick={() => updatePurchaseOrderStatus(po.id, 'delivered')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Receive Goods & Update Inventory</span>
                    </button>
                  )}
                  {po.status === 'delivered' && (
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded border flex items-center gap-1"
                      style={{
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success-text)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Goods Received into Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Stepper for this PO */}
              <div className="pt-3 pb-2">
                <div className="flex items-center justify-between text-[11px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span>Procurement Stage Progress:</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Step {currentStage + 1} of 5 ({stages[currentStage].desc})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      po.status === 'delivered' ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${((currentStage + 1) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* PO Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <div>
                  <span>Item SKU & Name:</span>
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{po.itemId}</div>
                  <div className="text-[11px] truncate">{po.itemName}</div>
                </div>
                <div>
                  <span>Order Quantity & Total:</span>
                  <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{po.quantity} units</div>
                  <div className="text-[11px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(po.totalPriceUsd)}
                  </div>
                </div>
                <div>
                  <span>Expected Arrival:</span>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{po.expectedDelivery}</div>
                  <div className="text-[11px]">Ordered: {po.orderDate}</div>
                </div>
                <div>
                  <span>Risk Assessment:</span>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {po.riskNotes || 'Nominal delivery schedule.'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
