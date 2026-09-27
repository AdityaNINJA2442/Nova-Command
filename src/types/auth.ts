/**
 * User Roles and Access Control Types
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'HR';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  initials: string;
  department: string;
  avatarBg: string;
  description: string;
}

export const DEMO_USERS: AppUser[] = [
  {
    id: 'user-admin',
    name: 'Admin User',
    email: 'admin.user@novacommand.io',
    role: 'ADMIN',
    title: 'System Administrator & Plant Director',
    initials: 'AU',
    department: 'Executive Operations',
    avatarBg: 'bg-purple-600 text-white',
    description: 'Full access to all application modules, data, configurations, and user management.',
  },
  {
    id: 'user-manager',
    name: 'Manager User',
    email: 'manager.user@novacommand.io',
    role: 'MANAGER',
    title: 'Operations & Production Manager',
    initials: 'MU',
    department: 'Shop Floor Operations',
    avatarBg: 'bg-blue-600 text-white',
    description: 'Access to operational modules: Command Center, Production, Factory Floor, Machines, Maintenance, Inventory, Procurement, Analytics.',
  },
  {
    id: 'user-hr',
    name: 'HR User',
    email: 'hr.user@novacommand.io',
    role: 'HR',
    title: 'Human Resources & People Operations',
    initials: 'HR',
    department: 'Human Resources',
    avatarBg: 'bg-emerald-600 text-white',
    description: 'Access to Command Center, Workforce, employee information, and HR analytics.',
  },
];

export interface RoleConfig {
  role: UserRole;
  label: string;
  badgeClass: string;
  description: string;
  allowedTabs: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  ADMIN: {
    role: 'ADMIN',
    label: 'ADMIN',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    description: 'Full administrative access across all system features and user management.',
    allowedTabs: [
      'command-center',
      'production',
      'factory-floor',
      'machines',
      'maintenance',
      'inventory',
      'procurement',
      'workforce',
      'quality',
      'orders',
      'what-if',
      'decision-center',
      'analytics',
      'admin-settings',
    ],
  },
  MANAGER: {
    role: 'MANAGER',
    label: 'MANAGER',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    description: 'Operational control across production, floor, equipment, inventory, procurement, and analytics.',
    allowedTabs: [
      'command-center',
      'production',
      'factory-floor',
      'machines',
      'maintenance',
      'inventory',
      'procurement',
      'workforce',
      'quality',
      'orders',
      'what-if',
      'decision-center',
      'analytics',
    ],
  },
  HR: {
    role: 'HR',
    label: 'HR',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    description: 'Access to Command Center, Workforce, and HR-related operational analytics.',
    allowedTabs: [
      'command-center',
      'workforce',
      'analytics',
    ],
  },
};

export function isTabAllowed(tabId: string, role: UserRole): boolean {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  return config.allowedTabs.includes(tabId);
}
