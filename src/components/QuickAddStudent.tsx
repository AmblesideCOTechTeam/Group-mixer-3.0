import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Student } from '../types';

interface QuickAddStudentProps {
  onAdd: (student: Student) => void;
  themeColors: { card: string; text: string; accent: string };
  effectiveTheme: 'light' | 'dark';
}

export function QuickAddStudent({ onAdd, themeColors, effectiveTheme }: QuickAddStudentProps) {
  const [formData, setFormData] = useState({
    first: '',
    last: '',
    grade: '1',
    gender: 'm' as 'm' | 'f',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first.trim() || !formData.last.trim()) {
      alert('Please enter first and last name');
      return;
    }

    const newStudent: Student = {
      first: formData.first.trim(),
      last: formData.last.trim(),
      grade: parseInt(formData.grade),
      gender: formData.gender,
      email: formData.email.trim() || `${formData.first.toLowerCase()}${formData.last.toLowerCase()}@school.com`
    };

    onAdd(newStudent);

    setFormData({
      first: '',
      last: '',
      grade: '1',
      gender: 'm',
      email: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: themeColors.text }}>
        <Plus size={20} />
        Add Student
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={formData.first}
            onChange={(e) => setFormData({ ...formData, first: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
            style={{
              borderColor: effectiveTheme === 'dark' ? '#374151' : '#d1d5db',
              backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
              color: themeColors.text
            }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.last}
            onChange={(e) => setFormData({ ...formData, last: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
            style={{
              borderColor: effectiveTheme === 'dark' ? '#374151' : '#d1d5db',
              backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
              color: themeColors.text
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
            style={{
              borderColor: effectiveTheme === 'dark' ? '#374151' : '#d1d5db',
              backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
              color: themeColors.text
            }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Grade {i + 1}
              </option>
            ))}
          </select>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'm' | 'f' })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
            style={{
              borderColor: effectiveTheme === 'dark' ? '#374151' : '#d1d5db',
              backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
              color: themeColors.text
            }}
          >
            <option value="m">Male</option>
            <option value="f">Female</option>
          </select>
        </div>

        <input
          type="email"
          placeholder="Email (optional)"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
          style={{
            borderColor: effectiveTheme === 'dark' ? '#374151' : '#d1d5db',
            backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
            color: themeColors.text
          }}
        />

        <button
          type="submit"
          className="w-full px-4 py-2 text-white rounded-lg font-medium transition-colors"
          style={{ backgroundColor: themeColors.accent }}
        >
          Add Student
        </button>
      </form>
    </div>
  );
}
