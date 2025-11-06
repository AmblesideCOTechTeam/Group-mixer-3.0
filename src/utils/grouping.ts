import { Student, ForcePairing, ForceAssignment } from '../types';

interface GroupingResult {
  success: boolean;
  groups: Array<{ name: string; students: Student[] }>;
  warnings: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createGroups(
  students: Student[],
  numGroups: number,
  groupNames: string[],
  forcePairings: ForcePairing[],
  forceAssignments: ForceAssignment[]
): GroupingResult {
  const warnings: string[] = [];
  const groups: Array<{ name: string; students: Student[] }> = [];

  for (let i = 0; i < numGroups; i++) {
    groups.push({
      name: groupNames[i] || `Group ${i + 1}`,
      students: []
    });
  }

  const studentsPerGroup = Math.floor(students.length / numGroups);
  const extraStudents = students.length % numGroups;

  // Randomize the initial order before any processing
  const allStudents = shuffleArray(shuffleArray(shuffleArray([...students])));
  const availableStudents = [...allStudents];

  forceAssignments.forEach(assignment => {
    if (assignment.groupIndex < numGroups) {
      const studentIndex = availableStudents.findIndex(s => s === assignment.student);
      if (studentIndex !== -1) {
        groups[assignment.groupIndex].students.push(assignment.student);
        availableStudents.splice(studentIndex, 1);
      }
    }
  });

  const pairingGroups = forcePairings.map(pairing => {
    const validStudents = pairing.students.filter(s => availableStudents.includes(s));
    validStudents.forEach(s => {
      const idx = availableStudents.indexOf(s);
      if (idx !== -1) {
        availableStudents.splice(idx, 1);
      }
    });
    return validStudents;
  });

  pairingGroups.forEach(pairingGroup => {
    if (pairingGroup.length === 0) return;

    let bestGroupIdx = 0;
    let minSize = groups[0].students.length;

    for (let i = 1; i < groups.length; i++) {
      if (groups[i].students.length < minSize) {
        minSize = groups[i].students.length;
        bestGroupIdx = i;
      }
    }

    groups[bestGroupIdx].students.push(...pairingGroup);
  });

  // Get unique grades from available students
  const uniqueGrades = Array.from(new Set(availableStudents.map(s => s.grade))).sort();
  const requiredGenders: Array<'m' | 'f'> = ['m', 'f'];

  // First pass: Ensure each group has at least one of each gender
  for (const gender of requiredGenders) {
    const groupIndices = shuffleArray(Array.from({ length: numGroups }, (_, i) => i));
    for (const i of groupIndices) {
      const groupHasGender = groups[i].students.some(s => s.gender === gender);
      if (!groupHasGender) {
        const studentIndex = availableStudents.findIndex(s => s.gender === gender);
        if (studentIndex !== -1) {
          groups[i].students.push(availableStudents[studentIndex]);
          availableStudents.splice(studentIndex, 1);
        }
      }
    }
  }

  // Second pass: Ensure each group has at least one from each grade
  for (const grade of uniqueGrades) {
    const groupIndices = shuffleArray(Array.from({ length: numGroups }, (_, i) => i));
    for (const i of groupIndices) {
      const groupHasGrade = groups[i].students.some(s => s.grade === grade);
      if (!groupHasGrade) {
        const studentIndex = availableStudents.findIndex(s => s.grade === grade);
        if (studentIndex !== -1) {
          groups[i].students.push(availableStudents[studentIndex]);
          availableStudents.splice(studentIndex, 1);
        }
      }
    }
  }

  // Distribute remaining students with randomized group order
  const distributionOrder = shuffleArray(Array.from({ length: numGroups }, (_, i) => i));
  let orderIndex = 0;

  while (availableStudents.length > 0) {
    const currentGroupIndex = distributionOrder[orderIndex % distributionOrder.length];
    const targetSize = currentGroupIndex < extraStudents ? studentsPerGroup + 1 : studentsPerGroup;

    if (groups[currentGroupIndex].students.length < targetSize) {
      groups[currentGroupIndex].students.push(availableStudents.shift()!);
    }

    orderIndex++;
    if (orderIndex >= numGroups) {
      orderIndex = 0;
    }
  }

  // Shuffle students within each group to make force pairings less obvious
  groups.forEach((group) => {
    group.students = shuffleArray(group.students);

    const grades = new Set(group.students.map(s => s.grade));
    const genders = new Set(group.students.map(s => s.gender));

    if (grades.size < uniqueGrades.length) {
      const missing = uniqueGrades.filter(g => !grades.has(g));
      warnings.push(`${group.name}: Missing grades ${missing.join(', ')}`);
    }

    if (genders.size < 2) {
      warnings.push(`${group.name}: Missing ${genders.has('m') ? 'female' : 'male'} students`);
    }
  });

  return {
    success: warnings.length === 0,
    groups,
    warnings
  };
}
