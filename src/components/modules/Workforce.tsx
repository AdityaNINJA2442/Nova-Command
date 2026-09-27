import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { Employee } from '../../types';

export const Workforce: React.FC = () => {
  const {
    employees,
    workOrders,
    assignTechnicianToWorkOrder,
    setActiveTab,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [assignWoId, setAssignWoId] = useState<string>('WO-204');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesShift = selectedShift === 'all' || emp.shift.includes(selectedShift);
    return matchesSearch && matchesShift;
  });

  const openWorkOrders = workOrders.filter((w) => w.status !== 'completed');

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Workforce Management & Skill Matrix
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Certified technical operators, shift capacity, mechatronics diagnostics roster, and intelligent task matching
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
            <span style={{ color: 'var(--text-secondary)' }}>Shift A Active: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {employees.filter((e) => e.availability === 'available').length} Available
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, skill, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Filter Shift:</span>
          {['all', 'Shift A', 'Shift B', 'Shift C'].map((shift) => (
            <button
              key={shift}
              onClick={() => setSelectedShift(shift)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer border font-semibold ${
                selectedShift === shift
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{
                backgroundColor: selectedShift === shift ? undefined : 'var(--surface-secondary)',
                borderColor: selectedShift === shift ? undefined : 'var(--border)',
                color: selectedShift === shift ? undefined : 'var(--text-secondary)',
              }}
            >
              {shift === 'all' ? 'All Shifts' : shift}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEmployees.map((emp) => {
          const isOverloaded = emp.workloadPct >= 85;

          return (
            <div
              key={emp.id}
              className="p-4 rounded-xl border transition-all shadow-xs"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: isOverloaded
                  ? isDark ? 'rgba(245, 158, 11, 0.4)' : '#FCD34D'
                  : 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-10 w-10 rounded-xl border flex items-center justify-center font-bold text-sm shadow-inner"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {emp.avatarInitials}
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                      {emp.name}
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>({emp.id})</span>
                    </div>
                    <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{emp.role}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    emp.availability === 'available'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : emp.availability === 'assigned'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {emp.availability}
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: 'var(--text-secondary)' }}>Shift Workload</span>
                  <span
                    className={`font-semibold ${
                      isOverloaded ? 'text-amber-600 dark:text-amber-400' : ''
                    }`}
                    style={{ color: isOverloaded ? undefined : 'var(--text-primary)' }}
                  >
                    {emp.workloadPct}% {isOverloaded && '(Near Capacity)'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className={`h-full rounded-full ${
                      isOverloaded ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${emp.workloadPct}%` }}
                  />
                </div>
              </div>

              {/* Details & Assigned Line */}
              <div className="text-[11px] space-y-1 border-t pt-2 mb-3" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <div className="flex justify-between">
                  <span>Shift:</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{emp.shift}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Line:</span>
                  <span className="truncate max-w-[150px] font-semibold" style={{ color: 'var(--text-primary)' }}>{emp.assignedLine}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Logged:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{emp.hoursWorkedThisWeek} hrs</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  Certified Competencies
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {emp.skills.map((skill, idx) => (
                    <span key={skill}>
                      <span className={skill.includes('Level 3') || skill.includes('Spindle') ? 'text-blue-600 dark:text-cyan-400 font-bold' : ''}>
                        {skill}
                      </span>
                      {idx < emp.skills.length - 1 && <span className="mx-1" style={{ color: 'var(--text-muted)' }}>·</span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Assign Action */}
              <div className="mt-3 pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                {emp.currentTaskId ? (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">Task: {emp.currentTaskId}</span>
                ) : (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>No active dispatch</span>
                )}
                <button
                  onClick={() => setSelectedEmp(emp)}
                  className="px-2.5 py-1 rounded border text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Dispatch / Assign
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="border rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Assign Work Order: {selectedEmp.name}
              </h3>
              <button
                onClick={() => setSelectedEmp(null)}
                className="hover:opacity-75 cursor-pointer text-slate-400"
              >
                ✕
              </button>
            </div>

            {/* Overload Warning */}
            {selectedEmp.workloadPct >= 85 && (
              <div
                className="p-3 rounded-lg border text-xs flex items-start gap-2"
                style={{
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FCD34D',
                  color: isDark ? '#FDE68A' : '#92400E',
                }}
              >
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Workload Warning:</span> Employee is currently at {selectedEmp.workloadPct}% capacity. Assigning additional tasks risks overtime fatigue.
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Target Maintenance Work Order</label>
                <select
                  value={assignWoId}
                  onChange={(e) => setAssignWoId(e.target.value)}
                  className="w-full p-2 rounded-lg border font-medium"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {openWorkOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.id} - {wo.machineId} ({wo.priority} priority - {wo.issue})
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill check */}
              {(() => {
                const targetWO = workOrders.find((w) => w.id === assignWoId);
                const hasSkill = selectedEmp.skills.some(
                  (s) =>
                    targetWO &&
                    (targetWO.requiredSkill.toLowerCase().includes(s.toLowerCase()) ||
                      s.toLowerCase().includes(targetWO.requiredSkill.toLowerCase()))
                );

                return (
                  <div
                    className="p-2.5 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>Required Skill: </span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{targetWO?.requiredSkill}</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      {hasSkill ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Certified Skill Match Verified
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Notice: Secondary skill certification required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setSelectedEmp(null)}
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
                  assignTechnicianToWorkOrder(assignWoId, selectedEmp.id);
                  setSelectedEmp(null);
                  setActiveTab('maintenance');
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-sm"
              >
                Confirm Dispatch Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
