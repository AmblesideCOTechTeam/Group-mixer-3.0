import { UserRole } from '../types/auth';
import { useAuth } from '../context/AuthContext';

type Permission =
  | 'view_settings'
  | 'modify_general'
  | 'modify_appearance'
  | 'modify_sounds'
  | 'add_student'
  | 'import_students'
  | 'view_history'
  | 'modify_history'
  | 'view_analytics'
  | 'force_pairing'
  | 'manage_groups'
  | 'reset_settings'
  | 'manage_users'
  | 'view_audit_logs'
  | 'lock_settings';

const permissionMatrix: Record<UserRole, Set<Permission>> = {
  admin: new Set([
    'view_settings',
    'modify_general',
    'modify_appearance',
    'modify_sounds',
    'add_student',
    'import_students',
    'view_history',
    'modify_history',
    'view_analytics',
    'force_pairing',
    'manage_groups',
    'reset_settings',
    'manage_users',
    'view_audit_logs',
    'lock_settings'
  ]),
  moderator: new Set([
    'view_settings',
    'modify_appearance',
    'modify_sounds',
    'add_student',
    'import_students',
    'view_history',
    'view_analytics',
    'manage_groups'
  ]),
  user: new Set([
    'view_settings',
    'modify_appearance',
    'modify_sounds',
    'view_history'
  ])
};

export function usePermissions() {
  const { user } = useAuth();

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return permissionMatrix[user.role].has(permission);
  };

  const cannot = (permission: Permission): boolean => {
    return !can(permission);
  };

  const canViewTab = (tabId: string): boolean => {
    switch (tabId) {
      case 'general':
      case 'appearance':
      case 'colors':
      case 'sounds':
      case 'help':
        return can('view_settings');
      case 'add-student':
        return can('add_student');
      case 'import':
        return can('import_students');
      case 'history':
        return can('view_history');
      case 'analytics':
        return can('view_analytics');
      case 'pairing':
        return can('force_pairing');
      case 'customize':
        return can('modify_general');
      case 'admin':
        return can('manage_users');
      case 'audit':
        return can('view_audit_logs');
      default:
        return false;
    }
  };

  return {
    can,
    cannot,
    canViewTab,
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    isUser: user?.role === 'user'
  };
}
