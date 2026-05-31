// NeuroFlow AI — Storage Utility
// Client-side persistence with localStorage

const STORAGE_PREFIX = 'neuroflow_';

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
};

// Default data generators
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const getDefaultSubjects = () => [
  { id: generateId(), name: 'Mathematics', color: '#7c3aed', icon: '📐', progress: 65, totalCards: 48, masteredCards: 31 },
  { id: generateId(), name: 'Computer Science', color: '#ec4899', icon: '💻', progress: 78, totalCards: 62, masteredCards: 48 },
  { id: generateId(), name: 'Physics', color: '#f97316', icon: '⚛️', progress: 42, totalCards: 35, masteredCards: 15 },
  { id: generateId(), name: 'Biology', color: '#14b8a6', icon: '🧬', progress: 55, totalCards: 40, masteredCards: 22 },
  { id: generateId(), name: 'English Literature', color: '#10b981', icon: '📚', progress: 70, totalCards: 30, masteredCards: 21 },
  { id: generateId(), name: 'History', color: '#f59e0b', icon: '🏛️', progress: 38, totalCards: 45, masteredCards: 17 },
];

export const getDefaultProfile = () => ({
  name: 'Student',
  level: 7,
  xp: 2450,
  xpToNext: 3000,
  totalStudyTime: 12480, // in minutes
  streak: 12,
  longestStreak: 18,
  cardsReviewed: 856,
  quizzesTaken: 34,
  avgScore: 82,
  joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  preferredStudyTime: 'evening',
  dailyGoalMinutes: 60,
  theme: 'dark',
});

export const getDefaultStudySessions = () => {
  const sessions = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const minutes = Math.floor(Math.random() * 120) + 15;
    if (Math.random() > 0.2) {
      sessions.push({
        id: generateId(),
        date: date.toISOString().split('T')[0],
        duration: minutes,
        subject: ['Mathematics', 'Computer Science', 'Physics', 'Biology', 'English Literature', 'History'][Math.floor(Math.random() * 6)],
        type: ['flashcards', 'quiz', 'notes', 'reading'][Math.floor(Math.random() * 4)],
        cardsReviewed: Math.floor(Math.random() * 30) + 5,
        score: Math.floor(Math.random() * 30) + 70,
      });
    }
  }
  return sessions;
};

export const getDefaultFlashcards = () => [
  // Mathematics
  { id: generateId(), subject: 'Mathematics', front: 'What is the Pythagorean Theorem?', back: 'a² + b² = c², where c is the hypotenuse of a right triangle', difficulty: 2, interval: 3, repetitions: 4, easeFactor: 2.5, nextReview: new Date(Date.now() + 86400000).toISOString(), tags: ['geometry', 'theorems'] },
  { id: generateId(), subject: 'Mathematics', front: 'Define the derivative of f(x)', back: 'f\'(x) = lim(h→0) [f(x+h) - f(x)] / h — The instantaneous rate of change of the function', difficulty: 3, interval: 1, repetitions: 2, easeFactor: 2.3, nextReview: new Date().toISOString(), tags: ['calculus'] },
  { id: generateId(), subject: 'Mathematics', front: 'What is the Quadratic Formula?', back: 'x = (-b ± √(b²-4ac)) / 2a, for ax² + bx + c = 0', difficulty: 1, interval: 7, repetitions: 6, easeFactor: 2.7, nextReview: new Date(Date.now() + 604800000).toISOString(), tags: ['algebra'] },
  { id: generateId(), subject: 'Mathematics', front: 'What is Euler\'s Identity?', back: 'e^(iπ) + 1 = 0 — Connects five fundamental constants', difficulty: 3, interval: 1, repetitions: 1, easeFactor: 2.1, nextReview: new Date().toISOString(), tags: ['complex numbers'] },
  // Computer Science
  { id: generateId(), subject: 'Computer Science', front: 'What is Big O Notation?', back: 'A mathematical notation describing the upper bound of an algorithm\'s time/space complexity as input grows', difficulty: 2, interval: 5, repetitions: 5, easeFactor: 2.6, nextReview: new Date(Date.now() + 432000000).toISOString(), tags: ['algorithms'] },
  { id: generateId(), subject: 'Computer Science', front: 'Explain Binary Search', back: 'Divide sorted array in half repeatedly. O(log n) time. Compare target with middle element, search left or right half.', difficulty: 1, interval: 10, repetitions: 7, easeFactor: 2.8, nextReview: new Date(Date.now() + 864000000).toISOString(), tags: ['algorithms', 'search'] },
  { id: generateId(), subject: 'Computer Science', front: 'What is a Hash Table?', back: 'Data structure mapping keys to values using a hash function. Average O(1) lookup, insert, delete. Handles collisions via chaining or open addressing.', difficulty: 2, interval: 3, repetitions: 3, easeFactor: 2.4, nextReview: new Date(Date.now() + 259200000).toISOString(), tags: ['data structures'] },
  { id: generateId(), subject: 'Computer Science', front: 'Difference between Stack and Queue?', back: 'Stack: LIFO (Last In First Out). Queue: FIFO (First In First Out). Both have O(1) push/pop/enqueue/dequeue.', difficulty: 1, interval: 14, repetitions: 8, easeFactor: 2.9, nextReview: new Date(Date.now() + 1209600000).toISOString(), tags: ['data structures'] },
  // Physics
  { id: generateId(), subject: 'Physics', front: 'State Newton\'s Second Law', back: 'F = ma — Force equals mass times acceleration. Net force on an object produces acceleration proportional to its mass.', difficulty: 1, interval: 7, repetitions: 5, easeFactor: 2.6, nextReview: new Date(Date.now() + 604800000).toISOString(), tags: ['mechanics'] },
  { id: generateId(), subject: 'Physics', front: 'What is the speed of light?', back: 'c ≈ 3 × 10⁸ m/s (299,792,458 m/s exactly). Maximum speed in the universe per special relativity.', difficulty: 1, interval: 14, repetitions: 9, easeFactor: 2.9, nextReview: new Date(Date.now() + 1209600000).toISOString(), tags: ['relativity', 'constants'] },
  { id: generateId(), subject: 'Physics', front: 'What is Schrödinger\'s Equation?', back: 'iℏ ∂Ψ/∂t = ĤΨ — Describes how quantum state of a system evolves over time. Ψ is the wave function, Ĥ is the Hamiltonian operator.', difficulty: 4, interval: 1, repetitions: 1, easeFactor: 2.0, nextReview: new Date().toISOString(), tags: ['quantum mechanics'] },
  // Biology
  { id: generateId(), subject: 'Biology', front: 'What is DNA replication?', back: 'Process where DNA makes a copy of itself. Helicase unwinds double helix, DNA polymerase synthesizes new strands. Semi-conservative process.', difficulty: 2, interval: 3, repetitions: 3, easeFactor: 2.4, nextReview: new Date(Date.now() + 259200000).toISOString(), tags: ['genetics'] },
  { id: generateId(), subject: 'Biology', front: 'Define Mitosis vs Meiosis', back: 'Mitosis: 1 division → 2 identical diploid cells (growth/repair). Meiosis: 2 divisions → 4 haploid cells (gametes). Meiosis has crossing over.', difficulty: 2, interval: 5, repetitions: 4, easeFactor: 2.5, nextReview: new Date(Date.now() + 432000000).toISOString(), tags: ['cell biology'] },
];

export const getDefaultNotes = () => [
  { id: generateId(), title: 'Calculus: Fundamental Theorems', subject: 'Mathematics', content: 'The First Fundamental Theorem of Calculus states that if f is continuous on [a,b] and F is an antiderivative of f, then the integral from a to b of f(x)dx = F(b) - F(a).\n\nThe Second Fundamental Theorem states that if f is continuous on an open interval I containing a, then for every x in I: d/dx[∫(a to x) f(t)dt] = f(x).\n\nKey applications:\n- Computing definite integrals\n- Finding areas under curves\n- Solving differential equations\n- Physics: work, displacement, etc.', color: '#7c3aed', tags: ['calculus', 'theorems'], createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), pinned: true },
  { id: generateId(), title: 'Data Structures Overview', subject: 'Computer Science', content: 'Common Data Structures:\n\n1. Arrays - O(1) access, O(n) insert/delete\n2. Linked Lists - O(n) access, O(1) insert/delete\n3. Hash Tables - O(1) average all operations\n4. Binary Trees - O(log n) balanced operations\n5. Graphs - Various traversal algorithms\n6. Heaps - O(log n) insert, O(1) find-min/max\n\nChoosing the right data structure depends on:\n- Access patterns\n- Insert/delete frequency\n- Memory constraints\n- Ordering requirements', color: '#ec4899', tags: ['data structures', 'algorithms'], createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(), pinned: false },
  { id: generateId(), title: 'Newton\'s Laws Summary', subject: 'Physics', content: 'Newton\'s Three Laws of Motion:\n\n1st Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.\n\n2nd Law: F = ma (Force equals mass times acceleration)\n\n3rd Law: For every action, there is an equal and opposite reaction.\n\nApplications in everyday life:\n- Seatbelts (1st law)\n- Rocket propulsion (3rd law)\n- Sports physics (2nd law)', color: '#f97316', tags: ['mechanics', 'laws'], createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(), pinned: true },
  { id: generateId(), title: 'Cell Biology: Organelles', subject: 'Biology', content: 'Key Organelles:\n\n🔬 Nucleus - Contains DNA, controls cell activities\n⚡ Mitochondria - Powerhouse, ATP production\n🏭 Ribosomes - Protein synthesis\n📦 Golgi Apparatus - Packaging and transport\n🧪 Endoplasmic Reticulum - Protein folding (rough) and lipid synthesis (smooth)\n🗑️ Lysosomes - Waste disposal\n🌿 Chloroplasts - Photosynthesis (plants only)\n🧱 Cell Wall - Structural support (plants only)', color: '#14b8a6', tags: ['cell biology', 'organelles'], createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(), pinned: false },
];

export const getDefaultBadges = () => [
  { id: 'first_card', name: 'First Card', desc: 'Review your first flashcard', icon: '🃏', unlocked: true, unlockedAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: 'streak_3', name: 'On Fire', desc: '3-day study streak', icon: '🔥', unlocked: true, unlockedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'streak_7', name: 'Week Warrior', desc: '7-day study streak', icon: '⚔️', unlocked: true, unlockedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'streak_14', name: 'Unstoppable', desc: '14-day study streak', icon: '🚀', unlocked: false },
  { id: 'streak_30', name: 'Legend', desc: '30-day study streak', icon: '👑', unlocked: false },
  { id: 'cards_50', name: 'Card Collector', desc: 'Review 50 flashcards', icon: '📇', unlocked: true, unlockedAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 'cards_200', name: 'Card Master', desc: 'Review 200 flashcards', icon: '🎴', unlocked: true, unlockedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'cards_500', name: 'Card Wizard', desc: 'Review 500 flashcards', icon: '🧙', unlocked: true, unlockedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'cards_1000', name: 'Card Sage', desc: 'Review 1000 flashcards', icon: '🏆', unlocked: false },
  { id: 'quiz_perfect', name: 'Perfect Score', desc: 'Get 100% on a quiz', icon: '💯', unlocked: true, unlockedAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'quiz_10', name: 'Quiz Addict', desc: 'Complete 10 quizzes', icon: '📝', unlocked: true, unlockedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'study_1h', name: 'Focused', desc: 'Study for 1 hour straight', icon: '🎯', unlocked: true, unlockedAt: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: 'study_5h', name: 'Marathon Runner', desc: 'Study for 5 hours in one day', icon: '🏃', unlocked: false },
  { id: 'notes_10', name: 'Scribe', desc: 'Create 10 notes', icon: '✍️', unlocked: false },
  { id: 'subjects_5', name: 'Renaissance', desc: 'Study 5 different subjects', icon: '🎨', unlocked: true, unlockedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: '⭐', unlocked: true, unlockedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 'level_10', name: 'Powerhouse', desc: 'Reach level 10', icon: '💎', unlocked: false },
  { id: 'night_owl', name: 'Night Owl', desc: 'Study after midnight', icon: '🦉', unlocked: true, unlockedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'early_bird', name: 'Early Bird', desc: 'Study before 6 AM', icon: '🐦', unlocked: false },
  { id: 'ai_chat', name: 'AI Explorer', desc: 'Have 10 conversations with AI tutor', icon: '🤖', unlocked: false },
];

export const getDefaultGoals = () => [
  { id: generateId(), title: 'Master Calculus Fundamentals', subject: 'Mathematics', target: 50, current: 31, unit: 'cards mastered', deadline: new Date(Date.now() + 14 * 86400000).toISOString(), status: 'active' },
  { id: generateId(), title: 'Complete Data Structures Course', subject: 'Computer Science', target: 100, current: 78, unit: '% completion', deadline: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'active' },
  { id: generateId(), title: 'Physics Quiz Score > 90%', subject: 'Physics', target: 90, current: 75, unit: '% avg score', deadline: new Date(Date.now() + 21 * 86400000).toISOString(), status: 'active' },
];
