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

  // Separate leaders from non-leaders
  const leaders = presentStudents.filter(s => s.leader);
  const nonLeaders = presentStudents.filter(s => !s.leader);

  // Handle force assignments and pairings first
  const availableStudents = [...presentStudents];
  const usedStudents = new Set<Student>();

  forceAssignments.forEach(assignment => {
    if (assignment.groupIndex < numGroups && availableStudents.includes(assignment.student)) {
      groups[assignment.groupIndex].students.push(assignment.student);
      usedStudents.add(assignment.student);
    }
  });

  const pairingGroups = forcePairings.map(pairing => {
    const validStudents = pairing.students.filter(s => availableStudents.includes(s) && !usedStudents.has(s));
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
    pairingGroup.forEach(s => usedStudents.add(s));
  });

  // Get remaining students (not used in forced assignments or pairings)
  const remainingStudents = presentStudents.filter(s => !usedStudents.has(s));
  const remainingLeaders = shuffleArray(remainingStudents.filter(s => s.leader));
  const remainingNonLeaders = shuffleArray(remainingStudents.filter(s => !s.leader));

  // Distribute leaders first - always into the smallest group
  remainingLeaders.forEach((leader) => {
    let smallestIdx = 0;
    let smallestSize = groups[0].students.length;

    for (let j = 1; j < numGroups; j++) {
      if (groups[j].students.length < smallestSize) {
        smallestSize = groups[j].students.length;
        smallestIdx = j;
      }
    }

    groups[smallestIdx].students.push(leader);
  });

  // Distribute non-leaders into smallest groups
  remainingNonLeaders.forEach((student) => {
    let smallestIdx = 0;
    let smallestSize = groups[0].students.length;

    for (let j = 1; j < numGroups; j++) {
      if (groups[j].students.length < smallestSize) {
        smallestSize = groups[j].students.length;
        smallestIdx = j;
      }
    }

    groups[smallestIdx].students.push(student);
  });

  // Sort leaders to the top of each group without visual indication
  groups.forEach((group) => {
    const leadersInGroup = group.students.filter(s => s.leader);
    const nonLeadersInGroup = group.students.filter(s => !s.leader);
    group.students = [...leadersInGroup, ...shuffleArray(nonLeadersInGroup)];

    const grades = new Set(group.students.map(s => s.grade));
    const genders = new Set(group.students.map(s => s.gender));

    if (grades.size < 4) {
      const missing = [9, 10, 11, 12].filter(g => !grades.has(g));
      // Don't add grade warnings
    }

    if (genders.size < 2) {
      // Don't add gender warnings
    }
  });

  return {
    success: warnings.length === 0,
    groups,
    warnings
  };
}
