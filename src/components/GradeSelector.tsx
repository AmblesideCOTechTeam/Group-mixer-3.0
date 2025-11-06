import { Student } from '../types';

interface GradeSelectorProps {
  students: Student[];
  selectedGrades: string[];
  onGradesChange: (grades: string[]) => void;
  themeColors: { card: string; text: string; accent: string; background: string };
  effectiveTheme: 'light' | 'dark';
}

export function GradeSelector({
  students,
  selectedGrades,
  onGradesChange,
  themeColors,
  effectiveTheme
}: GradeSelectorProps) {
  const availableGrades = Array.from(new Set(students.map(s => String(s.grade))))
    .sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return isNaN(aNum) || isNaN(bNum) ? a.localeCompare(b) : aNum - bNum;
    });

  const toggleGrade = (grade: string) => {
    if (selectedGrades.includes(grade)) {
      onGradesChange(selectedGrades.filter(g => g !== grade));
    } else {
      onGradesChange([...selectedGrades, grade]);
    }
  };

  const selectAll = () => {
    onGradesChange(availableGrades);
  };

  const clearAll = () => {
    onGradesChange([]);
  };

  if (availableGrades.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: themeColors.text }}>
        Filter by Grade
      </label>

      <div className="flex flex-wrap gap-2">
        {availableGrades.map((grade) => {
          const gradeLabel = `${grade}${isNaN(parseInt(grade)) ? '' : grade === '9' ? 'th' : grade === '10' ? 'th' : grade === '11' ? 'th' : 'th'}`;
          const isSelected = selectedGrades.includes(grade);

          return (
            <button
              key={grade}
              onClick={() => toggleGrade(grade)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isSelected ? 'text-white shadow-md' : ''
              }`}
              style={
                isSelected
                  ? { backgroundColor: themeColors.accent }
                  : {
                      backgroundColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb',
                      color: themeColors.text
                    }
              }
            >
              Grade {gradeLabel}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={selectAll}
          className="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#f3f4f6',
            color: themeColors.text
          }}
        >
          Select All
        </button>
        <button
          onClick={clearAll}
          className="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: effectiveTheme === 'dark' ? '#1f2937' : '#f3f4f6',
            color: themeColors.text
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
