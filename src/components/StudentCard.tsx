import { motion } from 'framer-motion';
import { Student } from '../types';
import { User } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  index: number;
}

const gradeColors: Record<number, string> = {
  6: 'bg-cyan-500',
  7: 'bg-teal-500',
  8: 'bg-sky-500',
  9: 'bg-blue-500',
  10: 'bg-green-500',
  11: 'bg-orange-500',
  12: 'bg-purple-500'
};

export function StudentCard({ student, index }: StudentCardProps) {
  const initials = `${student.first[0]}${student.last[0]}`;

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Get grade color with fallback
  const gradeColor = gradeColors[student.grade] || 'bg-gray-500';

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 0.6,
              delay: index * 0.08,
              ease: [0.4, 0, 0.2, 1]
            }
      }
      className="bg-white rounded-lg p-2 shadow-sm border border-gray-200"
    >
      <div className="font-medium text-gray-900 text-sm">
        {student.first} {student.last}
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
        <span className={`${gradeColor} text-white px-2 py-0.5 rounded-full font-medium`}>
          Grade {student.grade}
        </span>
        <span className="text-gray-400">
          {student.gender === 'm' ? '♂' : '♀'}
        </span>
      </div>
    </motion.div>
  );
}
