import { supabase } from './supabaseClient';
import { User, Session, LoginCredentials, UserRole } from '../types/auth';

const SESSION_TOKEN_KEY = 'grade-mixer-session-token';
const USER_KEY = 'grade-mixer-user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, created_at')
      .eq('username', credentials.username)
      .eq('password_hash', credentials.password)
      .maybeSingle();

    if (error || !users) {
      throw new Error('Invalid username or password');
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: users.id,
          token,
          expires_at: expiresAt
        }
      ]);

    if (sessionError) {
      throw new Error('Failed to create session');
    }

    const user: User = {
      id: users.id,
      username: users.username,
      role: users.role as UserRole,
      createdAt: users.created_at
    };

    localStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  async logout(userId: string, token: string): Promise<void> {
    await supabase
      .from('sessions')
      .delete()
      .eq('token', token);

    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async validateSession(): Promise<User | null> {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);

    if (!token || !user) {
      return null;
    }

    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('id, expires_at')
        .eq('token', token)
        .maybeSingle();

      if (error || !session) {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }

      if (new Date(session.expires_at) < new Date()) {
        await supabase
          .from('sessions')
          .delete()
          .eq('token', token);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }

      return JSON.parse(user);
    } catch {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  async promoteUser(username: string, newRole: UserRole): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('username', username);

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  },

  async logAction(userId: string, action: string, details: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: userId,
          action,
          details
        }
      ]);

    if (error) {
      console.error('Failed to log action:', error);
    }
  },

  async getAuditLogs(): Promise<any[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, user_id, action, details, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error('Failed to fetch audit logs');
    }

    return data || [];
  }
};
