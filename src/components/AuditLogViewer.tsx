import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { authService } from '../services/authService';
import { AuditLog } from '../types/auth';

export function AuditLogViewer() {
  const { can } = usePermissions();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (can('view_audit_logs')) {
      loadLogs();
    }
  }, []);

  const loadLogs = async () => {
    try {
      const data = await authService.getAuditLogs();
      setLogs(data.map(log => ({
        id: log.id,
        userId: log.user_id,
        action: log.action,
        details: log.details,
        createdAt: log.created_at
      })));
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!can('view_audit_logs')) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-700 font-medium">Insufficient Permissions</p>
          <p className="text-red-600 text-sm mt-1">
            Only administrators can view audit logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Activity size={20} />
        Audit Logs
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-600">
          Loading audit logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No audit logs available yet
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-gray-900">{log.action}</div>
                <div className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-gray-600">User ID: {log.userId}</div>
              {Object.keys(log.details).length > 0 && (
                <div className="mt-2 text-xs bg-white rounded p-2 border border-gray-200">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
