import { useState } from 'react';
import { Shield, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { UserRole } from '../types/auth';

export function AdminPanel() {
  const { user, logout, promoteUser } = useAuth();
  const { isAdmin } = usePermissions();
  const [promotionUsername, setPromotionUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('moderator');
  const [message, setMessage] = useState('');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-700 font-medium">Insufficient Permissions</p>
          <p className="text-red-600 text-sm mt-1">
            Only administrators can access this panel.
          </p>
        </div>
      </div>
    );
  }

  const handlePromoteUser = async () => {
    if (!promotionUsername.trim()) {
      setMessage('Please enter a username');
      return;
    }

    try {
      await promoteUser(promotionUsername, selectedRole);
      setMessage(`Successfully promoted ${promotionUsername} to ${selectedRole}`);
      setPromotionUsername('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to promote user');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 rounded-lg p-2">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600">Logged in as: <span className="font-semibold">{user?.username}</span></p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Admin Access Granted</p>
            <p className="text-sm text-blue-700 mt-1">
              You have full control over all settings and user management.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} />
          User Management
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username to Promote
            </label>
            <input
              type="text"
              value={promotionUsername}
              onChange={(e) => setPromotionUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">Normal User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handlePromoteUser}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Update User Role
          </button>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('Successfully')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
