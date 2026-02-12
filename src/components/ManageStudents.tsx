import { Users, Crown, Trash2, Clock } from 'lucide-react';
import { Student } from '../types';
import { useState } from 'react';

interface ManageStudentsProps {
  students: Student[];
  onUpdateStudent: (email: string, updates: Partial<Student>) => void;
  onRemoveStudent: (email: string) => void;
  themeColors: { card: string; text: string; accent: string };
  effectiveTheme: 'light' | 'dark';
}

export function ManageStudents({
  students,
  onUpdateStudent,
  onRemoveStudent,
  themeColors,
  effectiveTheme
}: ManageStudentsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s =>
    `${s.first} ${s.last}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLeader = (student: Student) => {
    onUpdateStudent(student.email, {
      role: student.role === 'leader' ? undefined : 'leader'
    });
  };

  const toggleAbsent = (student: Student) => {
    onUpdateStudent(student.email, {
      absent: !student.absent
    });
  };

  const handleRemove = (student: Student) => {
    if (confirm(`Remove ${student.first} ${student.last}? This cannot be undone.`)) {
      onRemoveStudent(student.email);
    }
  };

  const leaderCount = students.filter(s => s.role === 'leader').length;
  const absentCount = students.filter(s => s.absent).length;
  const presentCount = students.length - absentCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: themeColors.text }}>
          <Users size={20} />
          Manage Students
        </div>
        <div className="text-sm space-y-1 text-right" style={{ color: themeColors.text + '80' }}>
          <div>{presentCount} present • {absentCount} absent</div>
          <div>{leaderCount} leaders</div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search students..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
        style={{
          borderColor: effectiveTheme === 'dark' ? '#374151' : '#d1d5db',
          backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
          color: themeColors.text
        }}
      />

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredStudents.map((student) => (
          <div
            key={student.email}
            className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
              student.absent ? 'opacity-60' : ''
            }`}
            style={{
              borderColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: student.role === 'leader'
                ? (effectiveTheme === 'dark' ? '#422006' : '#fef3c7')
                : student.absent
                ? (effectiveTheme === 'dark' ? '#1e293b' : '#f3f4f6')
                : (effectiveTheme === 'dark' ? '#1f2937' : '#f9fafb')
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm flex items-center gap-2" style={{ color: themeColors.text }}>
                {student.role === 'leader' && <Crown size={14} className="text-yellow-600" />}
                {student.first} {student.last}
                {student.absent && <Clock size={14} className="text-slate-500" />}
              </div>
              <div className="text-xs mt-1" style={{ color: themeColors.text + '80' }}>
                Grade {student.grade} • {student.gender === 'm' ? 'Male' : 'Female'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleLeader(student)}
                className={`p-2 rounded-lg transition-colors ${
                  student.role === 'leader'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'hover:bg-yellow-100 text-yellow-600'
                }`}
                style={
                  student.role !== 'leader'
                    ? {
                        backgroundColor: effectiveTheme === 'dark' ? '#374151' : '#f3f4f6'
                      }
                    : undefined
                }
                title={student.role === 'leader' ? 'Remove leader role' : 'Assign leader role'}
              >
                <Crown size={16} />
              </button>
              <button
                onClick={() => toggleAbsent(student)}
                className={`p-2 rounded-lg transition-colors ${
                  student.absent
                    ? 'bg-slate-500 text-white hover:bg-slate-600'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
                style={
                  !student.absent
                    ? {
                        backgroundColor: effectiveTheme === 'dark' ? '#374151' : '#f3f4f6'
                      }
                    : undefined
                }
                title={student.absent ? 'Mark as present' : 'Mark as absent'}
              >
                <Clock size={16} />
              </button>
              <button
                onClick={() => handleRemove(student)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                style={{
                  backgroundColor: effectiveTheme === 'dark' ? '#374151' : '#f3f4f6'
                }}
                title="Remove student"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8" style={{ color: themeColors.text + '60' }}>
          <Users size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No students found</p>
        </div>
      )}

      <div className="p-3 rounded-lg border space-y-2" style={{
        borderColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb',
        backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#f9fafb'
      }}>
        <p className="text-xs font-semibold" style={{ color: themeColors.text }}>Legend:</p>
        <p className="text-xs" style={{ color: themeColors.text + '80' }}>
          <strong>Leader:</strong> Appears at top of group. System assigns one per group if available.
        </p>
        <p className="text-xs" style={{ color: themeColors.text + '80' }}>
          <strong>Absent:</strong> Student won't be included in group randomization.
        </p>
      </div>
    </div>
  );
}
