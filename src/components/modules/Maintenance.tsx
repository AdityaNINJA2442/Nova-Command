import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle,
  Plus,
  Play,
  Check,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { MaintenanceWorkOrder } from '../../types';

export const Maintenance: React.FC = () => {
  const {
    workOrders,
    machines,
    employees,
    inventory,
    createWorkOrder,
    assignTechnicianToWorkOrder,
    startWorkOrder,
    completeWorkOrder,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New WO form state
  const [newMachineId, setNewMachineId] = useState('M-004');
  const [newIssue, setNewIssue] = useState('Spindle bearing vibration threshold exceedance overhaul');
  const [newPriority, setNewPriority] = useState<MaintenanceWorkOrder['priority']>('critical');
  const [newType, setNewType] = useState<MaintenanceWorkOrder['type']>('corrective');
  const [newTechId, setNewTechId] = useState('EMP-01');
  const [newSparePart, setNewSparePart] = useState('SP-104');

  const filteredWOs = workOrders.filter((wo) => {
    if (activeTabFilter === 'open') return wo.status === 'open' || wo.status === 'assigned';
    if (activeTabFilter === 'in_progress') return wo.status === 'in_progress';
    if (activeTabFilter === 'completed') return wo.status === 'completed';
    return true;
  });

  const getPriorityStyle = (priority: MaintenanceWorkOrder['priority']) => {
    switch (priority) {
      case 'critical':
        return isDark
          ? 'bg-rose-950 text-rose-300 border-rose-800'
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
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    }
  };

  const getStatusStyle = (status: MaintenanceWorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return isDark
          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'in_progress':
        return isDark
          ? 'bg-blue-950 text-blue-300 border-blue-800'
          : 'bg-blue-100 text-blue-800 border-blue-300';
      case 'assigned':
        return isDark
          ? 'bg-purple-950 text-purple-300 border-purple-800'
          : 'bg-purple-100 text-purple-800 border-purple-300';
      case 'open':
      default:
        return isDark
          ? 'bg-amber-950 text-amber-300 border-amber-800'
          : 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Wrench className="h-5 w-5 text-amber-500" />
            Maintenance Operations & Work Order Lifecycle
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Work order tracking, technician skill verification, spare-part reservation, and machine restoration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {(['all', 'open', 'in_progress', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer border ${
              activeTabFilter === tab
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 shadow-xs'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            style={{
              borderColor: activeTabFilter === tab ? undefined : 'var(--border)',
              color: activeTabFilter === tab ? undefined : 'var(--text-secondary)',
            }}
          >
            {tab.replace('_', ' ')} Work Orders
          </button>
        ))}
      </div>

      {/* Work Orders List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredWOs.map((wo) => {
          const machine = machines.find((m) => m.id === wo.machineId);
          const tech = employees.find((e) => e.id === wo.technicianId);
          const parts = inventory.filter((i) => wo.sparePartIds.includes(i.id));
          const hasMissingPart = parts.some((p) => p.available <= 0 && p.reserved <= 0);

          return (
            <div
              key={wo.id}
              className="p-4 rounded-xl border transition-all shadow-xs"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: wo.priority === 'critical' && wo.status !== 'completed'
                  ? isDark ? 'rgba(239, 68, 68, 0.5)' : '#FCA5A5'
                  : 'var(--border)',
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs border"
                    style={{
                      backgroundColor: wo.status === 'completed'
                        ? isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7'
                        : isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                      color: wo.status === 'completed' ? 'var(--success-text)' : 'var(--warning-text)',
                      borderColor: wo.status === 'completed' ? 'var(--success-border)' : 'var(--warning-border)',
                    }}
                  >
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                        {wo.id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusStyle(wo.status)}`}>
                        {wo.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityStyle(wo.priority)}`}>
                        {wo.priority} Priority
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>· {wo.type}</span>
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      Target: {wo.machineId} ({machine?.name})
                    </div>
                  </div>
                </div>

                {/* Lifecycle Actions */}
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  {wo.status === 'open' && (
                    <button
                      onClick={() => assignTechnicianToWorkOrder(wo.id, 'EMP-01')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Assign Marcus Vance (Level 3)</span>
                    </button>
                  )}

                  {wo.status === 'assigned' && (
                    <button
                      onClick={() => startWorkOrder(wo.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start Work (Sets {wo.machineId} Offline)</span>
                    </button>
                  )}

                  {wo.status === 'in_progress' && (
                    <button
                      onClick={() => completeWorkOrder(wo.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark Completed & Restore Machine</span>
                    </button>
                  )}

                  {wo.status === 'completed' && (
                    <div
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded border"
                      style={{
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success-text)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Restored to Baseline</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Order Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Issue Diagnosis:</span>
                  <p className="font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{wo.issue}</p>
                  <p className="text-[11px] mt-1 italic" style={{ color: 'var(--text-secondary)' }}>{wo.notes}</p>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Assigned Technician:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {tech?.avatarInitials || 'NA'}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {wo.technicianName || 'Unassigned'}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        Req: {wo.requiredSkill}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Required Spare Parts:</span>
                  <div className="mt-1 space-y-1">
                    {parts.length > 0 ? (
                      parts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-1.5 rounded border"
                          style={{
                            backgroundColor: 'var(--surface-secondary)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.id}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              hasMissingPart ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {hasMissingPart ? 'Readiness Risk: Out of Stock' : 'Ready (Reserved)'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>No spare parts required</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="flex items-center justify-between text-[11px] pt-2.5 mt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <span>Created: {new Date(wo.created).toLocaleDateString()} · Est: {wo.estimatedDurationHours}h</span>
                <span>Due: {new Date(wo.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="border rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Wrench className="h-4 w-4 text-amber-500" />
                Create Maintenance Work Order
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="hover:opacity-75 cursor-pointer text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Target Machine</label>
                <select
                  value={newMachineId}
                  onChange={(e) => setNewMachineId(e.target.value)}
                  className="w-full p-2 rounded-lg border font-medium"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} - {m.name} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Issue Description</label>
                <input
                  type="text"
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  className="w-full p-2 rounded-lg border font-medium"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="corrective">Corrective</option>
                    <option value="preventive">Preventive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Assign Technician (Skill Match)</label>
                <select
                  value={newTechId}
                  onChange={(e) => setNewTechId(e.target.value)}
                  className="w-full p-2 rounded-lg border font-medium"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} - {e.role} ({e.availability})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Required Spare Part (Inventory Check)</label>
                <select
                  value={newSparePart}
                  onChange={(e) => setNewSparePart(e.target.value)}
                  className="w-full p-2 rounded-lg border font-medium"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {inventory
                    .filter((i) => i.category === 'spare_part')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.id} - {item.name} ({item.available} avail)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const tech = employees.find((e) => e.id === newTechId);
                  createWorkOrder({
                    machineId: newMachineId,
                    issue: newIssue,
                    priority: newPriority,
                    type: newType,
                    technicianId: newTechId,
                    technicianName: tech?.name,
                    sparePartIds: [newSparePart],
                  });
                  setShowCreateModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-sm"
              >
                Create & Reserve Part
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
