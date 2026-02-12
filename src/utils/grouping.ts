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

  // Filter out absent students
  const presentStudents = students.filter(s => !s.absent);
  const studentsPerGroup = Math.floor(presentStudents.length / numGroups);
  const extraStudents = presentStudents.length % numGroups;

  // Randomize the initial order before any processing
  const allStudents = shuffleArray(shuffleArray(shuffleArray([...presentStudents])));
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

  // Priority pass: Distribute students by grade to ensure even distribution
  const requiredGrades = [9, 10, 11, 12];
  const requiredGenders: Array<'m' | 'f'> = ['m', 'f'];

  // Distribute by grades first for better balance
  for (const grade of requiredGrades) {
    const studentsWithGrade = availableStudents.filter(s => s.grade === grade);
    const groupIndices = shuffleArray(Array.from({ length: numGroups }, (_, i) => i));

    studentsWithGrade.forEach((student, idx) => {
      const targetGroupIndex = groupIndices[idx % groupIndices.length];
      groups[targetGroupIndex].students.push(student);
      const availIdx = availableStudents.indexOf(student);
      if (availIdx !== -1) {
        availableStudents.splice(availIdx, 1);
      }
    });
  }

  // Balance by gender for remaining students
  for (const gender of requiredGenders) {
    const studentsWithGender = availableStudents.filter(s => s.gender === gender);
    const groupIndices = shuffleArray(Array.from({ length: numGroups }, (_, i) => i));

    studentsWithGender.forEach((student, idx) => {
      const targetGroupIndex = groupIndices[idx % groupIndices.length];
      groups[targetGroupIndex].students.push(student);
      const availIdx = availableStudents.indexOf(student);
      if (availIdx !== -1) {
        availableStudents.splice(availIdx, 1);
      }
    });
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

    if (grades.size < 4) {
      const missing = [9, 10, 11, 12].filter(g => !grades.has(g));
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
