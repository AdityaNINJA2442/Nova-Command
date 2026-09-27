import React from 'react';
import { ShieldAlert, ArrowLeft, Users, LayoutDashboard, KeyRound } from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { ROLE_CONFIGS } from '../../types/auth';

interface AccessRestrictedProps {
  attemptedTab: string;
  onOpenUserSelection?: () => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  attemptedTab,
  onOpenUserSelection,
}) => {
  const { currentUser, setActiveTab } = useManufacturingStore();

  const tabLabels: Record<string, string> = {
    'command-center': 'Command Center',
    'production': 'Production Planning',
    'factory-floor': 'Factory Floor',
    'machines': 'Machines & Telemetry',
    'maintenance': 'Maintenance Work Orders',
    'inventory': 'Inventory & Spare Parts',
    'procurement': 'Procurement Pipeline',
    'workforce': 'Workforce & Technicians',
    'quality': 'Quality Control',
    'orders': 'Orders & Delivery',
    'what-if': 'What-If Simulator',
    'decision-center': 'Decision Center',
    'analytics': 'Analytics & Cost Rollup',
    'admin-settings': 'Admin Settings & User Management',
  };

  const sectionName = tabLabels[attemptedTab] || attemptedTab;
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div
        className="max-w-lg w-full p-6 sm:p-8 rounded-2xl border shadow-xl text-center space-y-5"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Shield Icon Badge */}
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <span>HTTP 403 · FORBIDDEN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            You do not have the required permissions to access{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">{sectionName}</strong>.
          </p>
        </div>

        {/* Current User & Role Details */}
        <div
          className="p-4 rounded-xl border text-left text-xs space-y-2"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Active Session Credentials
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Signed in as:</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Current Role:</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${roleConfig.badgeClass}`}>
              Role: {currentUser.role}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Role Scope:</span>
            <span className="text-[11px] text-right max-w-[280px]" style={{ color: 'var(--text-secondary)' }}>
              {roleConfig.description}
            </span>
          </div>
        </div>

        {/* Allowed Sections for this Role */}
        <div className="text-xs text-left space-y-2">
          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Available sections for {currentUser.role}:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roleConfig.allowedTabs.map((tabId) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className="px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer hover:border-blue-400 transition-colors"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {tabLabels[tabId] || tabId}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('command-center')}
            className="w-full sm:flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Command Center</span>
          </button>

          {onOpenUserSelection && (
            <button
              onClick={onOpenUserSelection}
              className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Switch User Role</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
