// NeuroFlow AI — AI Engine
// Simulates AI features using pattern matching, templates, and NLP-lite techniques

const SUBJECTS = ['Mathematics', 'Computer Science', 'Physics', 'Biology', 'Chemistry', 'History', 'English Literature', 'Economics'];

// ============================================================
// STUDY PLAN GENERATOR
// ============================================================
export function generateStudyPlan(params) {
  const { subjects, hoursPerDay, goalDate, focusAreas } = params;
  const daysUntilGoal = Math.max(1, Math.round((new Date(goalDate) - new Date()) / 86400000));
  const totalHours = hoursPerDay * daysUntilGoal;

  const plan = subjects.map((subject, i) => {
    const allocatedHours = Math.round((totalHours / subjects.length) * (1 + (focusAreas?.includes(subject) ? 0.3 : 0)));
    const sessions = Math.round(allocatedHours / 1.5);
    return {
      subject,
      allocatedHours,
      sessions,
      weeklyGoal: Math.round(allocatedHours / Math.max(1, daysUntilGoal / 7)),
      priority: focusAreas?.includes(subject) ? 'high' : 'medium',
      techniques: getStudyTechniques(subject),
      milestones: generateMilestones(subject, daysUntilGoal),
    };
  });

  const dailySchedule = generateDailySchedule(plan, hoursPerDay);

  return {
    id: Date.now().toString(36),
    createdAt: new Date().toISOString(),
    subjects,
    daysUntilGoal,
    totalHours,
    hoursPerDay,
    plan,
    dailySchedule,
    tips: getStudyTips(),
  };
}

function getStudyTechniques(subject) {
  const techniques = {
    Mathematics: ['Practice problems daily', 'Work through proofs step-by-step', 'Use visual diagrams', 'Create formula sheets'],
    'Computer Science': ['Code daily', 'Review algorithm complexity', 'Build small projects', 'Use LeetCode/HackerRank'],
    Physics: ['Draw free-body diagrams', 'Derive formulas from first principles', 'Lab simulations', 'Problem sets'],
    Biology: ['Create concept maps', 'Use mnemonics for nomenclature', 'Flashcard species/processes', 'Watch animations'],
    Chemistry: ['Balance equations daily', 'Memorize periodic trends', 'Practice stoichiometry', 'Lab practicals'],
    History: ['Create timelines', 'Connect cause and effect', 'Primary source analysis', 'Essay practice'],
    'English Literature': ['Active reading with annotation', 'Theme analysis', 'Comparative essays', 'Quote memorization'],
    Economics: ['Graph interpretation', 'Real-world examples', 'Model diagrams', 'Past paper practice'],
  };
  return techniques[subject] || ['Active recall', 'Spaced repetition', 'Practice tests', 'Concept mapping'];
}

function generateMilestones(subject, days) {
  const q = Math.round(days / 4);
  return [
    { week: 1, target: `Complete foundational ${subject} modules`, daysFromNow: q },
    { week: 2, target: `Pass mid-level ${subject} practice test (>70%)`, daysFromNow: q * 2 },
    { week: 3, target: `Master advanced ${subject} concepts`, daysFromNow: q * 3 },
    { week: 4, target: `Score >85% on ${subject} mock exam`, daysFromNow: days },
  ];
}

function generateDailySchedule(plan, hoursPerDay) {
  const slots = [];
  const minutes = hoursPerDay * 60;
  const perSubject = Math.round(minutes / plan.length);
  let hour = 9;
  plan.forEach((p, i) => {
    slots.push({
      subject: p.subject,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      duration: perSubject,
      activity: i % 2 === 0 ? 'Flashcard Review + Active Recall' : 'Problem Solving + Practice Tests',
    });
    hour += Math.ceil(perSubject / 60);
    if (hour >= 22) hour = 9;
  });
  return slots;
}

function getStudyTips() {
  const tips = [
    '🧠 Use the Pomodoro Technique: 25 minutes focused study, 5 minute break',
    '💤 Get 7-9 hours of sleep — memory consolidation happens during sleep',
    '🏃 Exercise before studying boosts BDNF and improves focus by up to 20%',
    '✏️ Write notes by hand for better retention than typing',
    '🔄 Review new material within 24 hours to strengthen memory traces',
    '🎯 Set specific, measurable goals for each study session',
    '📵 Use app blockers during study sessions to minimize distractions',
    '🧘 Brief mindfulness meditation improves working memory capacity',
  ];
  return tips.sort(() => Math.random() - 0.5).slice(0, 4);
}

// ============================================================
// FLASHCARD GENERATOR
// ============================================================
export function generateFlashcards(text, subject, count = 5) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const cards = [];

  const templates = [
    (s) => ({ front: `What is the key concept described here: "${s.trim().substring(0, 60)}..."?`, back: s.trim() }),
    (s) => ({ front: `Define the term mentioned in: "${extractKeyTerm(s)}"`, back: `${extractKeyTerm(s)}: ${s.trim()}` }),
    (s) => ({ front: `Explain: ${s.trim().substring(0, 80)}`, back: s.trim() }),
    (s) => ({ front: `What does this statement imply: "${s.trim().substring(0, 70)}..."?`, back: s.trim() }),
  ];

  const usedSentences = sentences.slice(0, count);
  usedSentences.forEach((sentence, i) => {
    const template = templates[i % templates.length];
    const { front, back } = template(sentence);
    cards.push({
      id: Date.now().toString(36) + i,
      subject: subject || 'General',
      front,
      back,
      difficulty: 2,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date().toISOString(),
      tags: [subject?.toLowerCase() || 'general', 'ai-generated'],
      aiGenerated: true,
    });
  });

  // If not enough sentences, add template cards
  while (cards.length < count) {
    cards.push({
      id: Date.now().toString(36) + cards.length,
      subject: subject || 'General',
      front: `Key concept ${cards.length + 1} from your notes`,
      back: `Review your notes for more details on this topic`,
      difficulty: 2,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date().toISOString(),
      tags: [subject?.toLowerCase() || 'general'],
      aiGenerated: true,
    });
  }

  return cards;
}

function extractKeyTerm(sentence) {
  const words = sentence.trim().split(' ');
  const candidates = words.filter(w => w.length > 5 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase());
  return candidates[0] || words.filter(w => w.length > 5)[0] || 'this concept';
}

// ============================================================
// QUIZ GENERATOR
// ============================================================
export function generateQuiz(subject, difficulty = 'medium', count = 10) {
  const questionBank = getQuestionBank(subject, difficulty);
  const selected = shuffleArray(questionBank).slice(0, count);
  return {
    id: Date.now().toString(36),
    subject,
    difficulty,
    questions: selected.map((q, i) => ({ ...q, id: i + 1 })),
    timeLimit: count * 60, // 60 seconds per question
    createdAt: new Date().toISOString(),
  };
}

function getQuestionBank(subject, difficulty) {
  const banks = {
    Mathematics: [
      { question: 'What is the derivative of sin(x)?', options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'], correct: 0, explanation: 'The derivative of sin(x) is cos(x) by differentiation rules.' },
      { question: 'Solve: If f(x) = x² + 3x, what is f\'(x)?', options: ['2x', '2x + 3', 'x + 3', '2x² + 3'], correct: 1, explanation: 'Using power rule: d/dx(x²) = 2x, d/dx(3x) = 3, so f\'(x) = 2x + 3.' },
      { question: 'What is the integral of 2x?', options: ['x²', 'x² + C', '2', 'x + C'], correct: 1, explanation: '∫2x dx = x² + C, where C is the constant of integration.' },
      { question: 'In a right triangle, if one leg is 3 and hypotenuse is 5, what is the other leg?', options: ['3', '4', '5', '6'], correct: 1, explanation: 'By Pythagorean theorem: 3² + b² = 5², so b² = 16, b = 4.' },
      { question: 'What is log₂(8)?', options: ['2', '3', '4', '8'], correct: 1, explanation: '2³ = 8, so log₂(8) = 3.' },
      { question: 'What is the sum of interior angles of a hexagon?', options: ['540°', '720°', '900°', '1080°'], correct: 1, explanation: '(n-2) × 180° = (6-2) × 180° = 720°.' },
      { question: 'Which of these is a prime number?', options: ['91', '87', '97', '93'], correct: 2, explanation: '97 is prime. 91 = 7×13, 87 = 3×29, 93 = 3×31.' },
      { question: 'What is 5! (5 factorial)?', options: ['25', '60', '120', '150'], correct: 2, explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.' },
      { question: 'The quadratic x² - 5x + 6 = 0 has roots:', options: ['2 and 3', '1 and 6', '−2 and −3', '2 and −3'], correct: 0, explanation: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3.' },
      { question: 'What is the slope of y = 3x - 7?', options: ['-7', '3', '-3', '7'], correct: 1, explanation: 'In y = mx + b form, m is the slope. Here m = 3.' },
    ],
    'Computer Science': [
      { question: 'What is the time complexity of Binary Search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2, explanation: 'Binary search halves the search space each step, giving O(log n).' },
      { question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Heap', 'Tree'], correct: 1, explanation: 'Stack uses Last In First Out (LIFO) principle.' },
      { question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Hyperlink Transfer Protocol', 'HyperText Transmission Process'], correct: 0, explanation: 'HTTP = HyperText Transfer Protocol, the foundation of web communication.' },
      { question: 'Which sorting algorithm has best average case O(n log n)?', options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'], correct: 2, explanation: 'Quick Sort averages O(n log n), while Bubble/Selection/Insertion are O(n²).' },
      { question: 'What is a deadlock in OS?', options: ['When CPU overheats', 'When two processes wait for each other indefinitely', 'When memory is full', 'When a process crashes'], correct: 1, explanation: 'Deadlock: two or more processes are permanently blocked waiting for resources held by each other.' },
      { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'System Query Language', 'Standard Query List'], correct: 0, explanation: 'SQL = Structured Query Language for managing relational databases.' },
      { question: 'Which is NOT an OOP principle?', options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'], correct: 2, explanation: 'The four OOP principles are Encapsulation, Inheritance, Polymorphism, and Abstraction.' },
      { question: 'What is recursion?', options: ['A loop construct', 'A function that calls itself', 'An array traversal', 'Memory allocation'], correct: 1, explanation: 'Recursion: a function that calls itself with a smaller subproblem until reaching a base case.' },
      { question: 'What is a hash collision?', options: ['When two keys hash to the same value', 'When the hash table is full', 'When hashing fails', 'A security breach'], correct: 0, explanation: 'Hash collision: two different inputs produce the same hash output.' },
      { question: 'REST stands for?', options: ['Reliable State Transfer', 'Representational State Transfer', 'Remote Endpoint State Transfer', 'Resource State Transmission'], correct: 1, explanation: 'REST = Representational State Transfer, an architectural style for web APIs.' },
    ],
    Physics: [
      { question: 'What is the SI unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correct: 2, explanation: 'Force is measured in Newtons (N). 1 N = 1 kg·m/s².' },
      { question: 'What is the speed of light in vacuum?', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], correct: 1, explanation: 'Speed of light c ≈ 3 × 10⁸ m/s (299,792,458 m/s exactly).' },
      { question: 'E = mc² relates energy to:', options: ['Velocity', 'Mass', 'Charge', 'Temperature'], correct: 1, explanation: 'E = mc² shows mass-energy equivalence. E is energy, m is mass, c is speed of light.' },
      { question: 'Which law states that F = ma?', options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Hooke\'s Law'], correct: 1, explanation: 'Newton\'s Second Law: net force equals mass times acceleration.' },
      { question: 'What is Ohm\'s Law?', options: ['P = IV', 'V = IR', 'F = qE', 'E = hf'], correct: 1, explanation: 'Ohm\'s Law: V = IR, where V is voltage, I is current, R is resistance.' },
      { question: 'What type of wave is light?', options: ['Mechanical wave', 'Longitudinal wave', 'Electromagnetic wave', 'Seismic wave'], correct: 2, explanation: 'Light is an electromagnetic wave that can travel through vacuum.' },
      { question: 'What is the unit of electrical resistance?', options: ['Farad', 'Henry', 'Ohm', 'Coulomb'], correct: 2, explanation: 'Electrical resistance is measured in Ohms (Ω).' },
      { question: 'Kinetic energy formula:', options: ['KE = mgh', 'KE = ½mv²', 'KE = mv', 'KE = ½mv'], correct: 1, explanation: 'Kinetic energy KE = ½mv² where m is mass and v is velocity.' },
      { question: 'What causes a rainbow?', options: ['Reflection only', 'Refraction only', 'Diffraction', 'Dispersion and refraction'], correct: 3, explanation: 'Rainbows are caused by dispersion (different wavelengths bending at different angles) and refraction in water droplets.' },
      { question: 'The period of a pendulum depends on:', options: ['Mass only', 'Amplitude only', 'Length and gravity', 'Mass and length'], correct: 2, explanation: 'T = 2π√(L/g). Period depends on length (L) and gravitational acceleration (g), not mass.' },
    ],
    Biology: [
      { question: 'What organelle is the "powerhouse of the cell"?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'], correct: 2, explanation: 'Mitochondria produce ATP through cellular respiration, earning the "powerhouse" title.' },
      { question: 'DNA stands for:', options: ['Deoxyribonucleic Acid', 'Deoxyribose Nitrogen Acid', 'Deoxyribose Nucleotide Acid', 'Double Nucleic Acid'], correct: 0, explanation: 'DNA = Deoxyribonucleic Acid, the molecule carrying genetic information.' },
      { question: 'Which process produces oxygen?', options: ['Cellular Respiration', 'Fermentation', 'Photosynthesis', 'Glycolysis'], correct: 2, explanation: 'Photosynthesis uses CO₂ + H₂O + light energy → glucose + O₂.' },
      { question: 'How many chromosomes do human somatic cells have?', options: ['23', '46', '48', '92'], correct: 1, explanation: 'Human somatic (body) cells are diploid with 46 chromosomes (23 pairs).' },
      { question: 'What is the role of ribosomes?', options: ['DNA replication', 'Protein synthesis', 'Energy production', 'Cell division'], correct: 1, explanation: 'Ribosomes translate mRNA into proteins — they are sites of protein synthesis.' },
      { question: 'Which blood type is the universal donor?', options: ['Type A', 'Type B', 'Type AB', 'Type O-'], correct: 3, explanation: 'Type O negative (O-) lacks A, B antigens and Rh factor, making it compatible with all blood types.' },
      { question: 'What is natural selection?', options: ['Random mutation', 'Survival of organisms best adapted to environment', 'Genetic drift', 'Artificial breeding'], correct: 1, explanation: 'Natural selection: organisms with favorable traits are more likely to survive and reproduce.' },
      { question: 'The basic unit of heredity is:', options: ['Chromosome', 'Nucleotide', 'Gene', 'Allele'], correct: 2, explanation: 'A gene is the basic unit of heredity — a sequence of DNA encoding a functional protein or RNA.' },
      { question: 'What is osmosis?', options: ['Movement of solutes across membrane', 'Movement of water across semi-permeable membrane', 'Active transport', 'Endocytosis'], correct: 1, explanation: 'Osmosis: passive movement of water molecules across a semi-permeable membrane from high to low water concentration.' },
      { question: 'CRISPR-Cas9 is used for:', options: ['DNA sequencing', 'PCR amplification', 'Gene editing', 'Protein folding'], correct: 2, explanation: 'CRISPR-Cas9 is a revolutionary gene-editing tool that can precisely modify DNA sequences.' },
    ],
  };

  const defaultBank = [
    { question: `What is the fundamental principle of ${subject}?`, options: ['Core theory A', 'Core theory B', 'Core theory C', 'Core theory D'], correct: 0, explanation: `This covers the foundational concepts of ${subject}.` },
    { question: `Which method is commonly used in ${subject} research?`, options: ['Observation', 'Experimentation', 'Analysis', 'All of the above'], correct: 3, explanation: `${subject} uses multiple research methods including observation, experimentation, and analysis.` },
    { question: `What year was the field of ${subject} formally established?`, options: ['19th century', '20th century', '18th century', '21st century'], correct: 1, explanation: `Most modern academic disciplines were formally established in the 20th century.` },
  ];

  return banks[subject] || defaultBank;
}

// ============================================================
// TEXT SUMMARIZER
// ============================================================
export function summarizeText(text) {
  if (!text || text.length < 50) return 'Please provide more text to summarize.';

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  if (sentences.length === 0) return text;

  // Score sentences by keyword frequency
  const words = text.toLowerCase().split(/\s+/);
  const freq = {};
  words.forEach(w => { if (w.length > 4) freq[w] = (freq[w] || 0) + 1; });

  const scored = sentences.map(s => ({
    sentence: s.trim(),
    score: s.toLowerCase().split(/\s+/).reduce((acc, w) => acc + (freq[w] || 0), 0),
  }));

  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)));

  // Restore original order
  const summaryLines = top
    .sort((a, b) => scored.indexOf(a) - scored.indexOf(b))
    .map(s => `• ${s.sentence}`);

  return `**Key Points:**\n${summaryLines.join('\n')}`;
}

// ============================================================
// AI CHATBOT TUTOR
// ============================================================
const chatResponses = {
  greet: [
    "Hello! I'm NeuroFlow, your AI learning companion. What subject would you like to explore today?",
    "Hi there! Ready to learn something amazing? Ask me anything about your studies!",
    "Welcome back! Your study streak is looking great. What can I help you master today?",
  ],
  math: [
    "Great question! In mathematics, the key is to understand **why** formulas work, not just memorize them. Let me break this down step by step...",
    "Mathematics is all about logical reasoning. Here's how to approach this problem systematically:\n\n1. Identify what's given\n2. Identify what you need to find\n3. Choose the appropriate formula or theorem\n4. Solve step by step",
    "This is a classic problem! The trick here is to recognize the pattern. Let me guide you through it...",
  ],
  cs: [
    "Excellent! Computer Science is about problem decomposition. Let's think about this algorithmically:\n\n1. **Input**: What data do we have?\n2. **Process**: What transformations do we need?\n3. **Output**: What result do we want?\n\nThis approach works for any programming challenge!",
    "Great CS question! Remember: **Time complexity** tells you HOW FAST your algorithm runs, **Space complexity** tells you HOW MUCH MEMORY it uses. Both matter!",
    "In programming, there are usually multiple solutions. The best one balances readability, performance, and maintainability. Let me explain the trade-offs...",
  ],
  physics: [
    "Physics is beautiful because everything connects back to a few fundamental laws. Here's the key insight:\n\n**Everything in mechanics comes from Newton's laws.**\n**Everything in E&M comes from Maxwell's equations.**\n\nOnce you master the fundamentals, everything else follows!",
    "Great physics question! Always start by drawing a **free body diagram** — it makes the forces visible and the problem becomes much clearer.",
    "Remember: in physics, units are your best friend. Always check that units balance on both sides of an equation. If they don't, something is wrong!",
  ],
  biology: [
    "Biology is the science of life! The key to understanding biological systems is recognizing patterns:\n\n**Structure → Function** is the golden rule. Everything in biology has a structure perfectly adapted for its function.",
    "Great biology question! Think about this at multiple levels: molecular, cellular, organ, organism, population, ecosystem. Each level has its own rules!",
    "Evolution is the unifying theory of biology — Charles Darwin said it best: 'Nothing in biology makes sense except in the light of evolution.'",
  ],
  study: [
    "Here are my top evidence-based study strategies:\n\n1. 🔄 **Spaced Repetition** — Review material at increasing intervals\n2. ✏️ **Active Recall** — Test yourself instead of re-reading\n3. 🎯 **Interleaving** — Mix different subjects/problems\n4. 📝 **Elaboration** — Explain concepts in your own words\n5. 💤 **Sleep** — Memory consolidates during sleep!\n\nWhich one do you want to learn more about?",
    "The #1 study mistake is **passive re-reading**. Your brain doesn't learn from seeing information — it learns from retrieving it. That's why our flashcard system works so well!",
    "For optimal studying: study in 25-minute focused sessions (Pomodoro technique), take a 5-minute break, repeat 4 times, then take a 30-minute break. Your focus will be much sharper!",
  ],
  motivation: [
    "You're doing amazing! Remember: **every expert was once a beginner**. The fact that you're here studying means you're already ahead of those who aren't trying. Keep going! 💪",
    "Feeling stuck? That's actually a good sign — it means you're working at the edge of your ability, which is exactly where growth happens. Take a short break and come back fresh!",
    "Your brain is like a muscle — it gets stronger the more you challenge it. Every difficult problem you wrestle with is building new neural connections. You're literally becoming smarter right now! 🧠",
  ],
  default: [
    "That's a fascinating question! Let me think about the best way to explain this...\n\nThe core concept here involves understanding the relationship between the key variables. In essence:\n\n• Start with the fundamentals\n• Build up systematically\n• Connect new knowledge to what you already know\n\nWhat aspect would you like me to dive deeper into?",
    "Great question! This is actually a topic many students find challenging at first, but once the core idea clicks, everything becomes clear.\n\nThe key insight is: **break it down into smaller steps**. What specifically are you struggling with?",
    "I love helping with this! Let me explain it from first principles. Remember, true understanding means being able to explain the concept simply. Here's how I'd approach it...",
    "Interesting! This connects to several important concepts. Let me give you a structured answer:\n\n**Definition**: The core idea\n**Why it matters**: Real-world applications\n**How to remember it**: A useful mnemonic or pattern\n\nLet me know if you want me to go deeper on any of these!",
  ],
};

export function getAIResponse(message) {
  const lower = message.toLowerCase();

  // Detect intent
  if (/hello|hi|hey|start|begin/.test(lower)) return randomPick(chatResponses.greet);
  if (/math|calculus|algebra|geometry|derivative|integral|equation/.test(lower)) return randomPick(chatResponses.math);
  if (/code|programming|algorithm|computer|software|data structure|complexity/.test(lower)) return randomPick(chatResponses.cs);
  if (/physics|force|energy|wave|quantum|newton|velocity|acceleration/.test(lower)) return randomPick(chatResponses.physics);
  if (/biology|cell|dna|gene|evolution|organism|protein|bacteria/.test(lower)) return randomPick(chatResponses.biology);
  if (/study|learn|remember|memorize|technique|strategy|exam/.test(lower)) return randomPick(chatResponses.study);
  if (/motivat|struggle|hard|difficult|tired|give up|stuck/.test(lower)) return randomPick(chatResponses.motivation);

  return randomPick(chatResponses.default);
}

// ============================================================
// PERFORMANCE PREDICTOR
// ============================================================
export function predictPerformance(sessions, flashcards, avgScore) {
  if (!sessions || sessions.length === 0) return null;

  const recentSessions = sessions.slice(0, 7);
  const avgDuration = recentSessions.reduce((a, s) => a + s.duration, 0) / recentSessions.length;
  const consistency = recentSessions.length / 7;
  const masteryRate = flashcards.filter(c => c.repetitions >= 5).length / Math.max(1, flashcards.length);

  const readinessScore = Math.round(
    (avgDuration / 60) * 20 + // Study duration weight
    consistency * 30 + // Consistency weight
    masteryRate * 30 + // Mastery weight
    (avgScore / 100) * 20 // Score weight
  );

  const clampedScore = Math.min(100, Math.max(0, readinessScore));

  let recommendation;
  if (clampedScore >= 80) recommendation = "You're well-prepared! Focus on weak areas and do mock exams.";
  else if (clampedScore >= 60) recommendation = "Good progress! Increase daily study time and practice more.";
  else if (clampedScore >= 40) recommendation = "Build consistency — aim for at least 45 min/day study sessions.";
  else recommendation = "Start with fundamentals and use spaced repetition daily.";

  return {
    readinessScore: clampedScore,
    recommendation,
    factors: {
      studyConsistency: Math.round(consistency * 100),
      avgStudyDuration: Math.round(avgDuration),
      masteryRate: Math.round(masteryRate * 100),
      quizAverage: avgScore,
    },
  };
}

// ============================================================
// XP CALCULATOR
// ============================================================
export function calculateXP(action, data = {}) {
  const xpTable = {
    flashcard_review: 5,
    flashcard_perfect: 15,
    quiz_complete: 20,
    quiz_perfect: 50,
    study_session: 10,
    streak_day: 25,
    note_created: 8,
    goal_achieved: 100,
    badge_unlocked: 30,
  };
  return xpTable[action] || 5;
}

// ============================================================
// KNOWLEDGE GRAPH DATA GENERATOR
// ============================================================
export function generateKnowledgeGraph(subjects) {
  const nodes = [];
  const links = [];

  const conceptMap = {
    Mathematics: ['Calculus', 'Algebra', 'Geometry', 'Statistics', 'Trigonometry'],
    'Computer Science': ['Algorithms', 'Data Structures', 'Operating Systems', 'Databases', 'Networks'],
    Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Mechanics', 'Optics'],
    Biology: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Physiology'],
    Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry', 'Analytical Chemistry'],
  };

  const connections = [
    ['Calculus', 'Mechanics'], ['Algebra', 'Algorithms'], ['Statistics', 'Data Structures'],
    ['Genetics', 'Biochemistry'], ['Quantum Mechanics', 'Physical Chemistry'],
    ['Thermodynamics', 'Physical Chemistry'], ['Calculus', 'Electromagnetism'],
    ['Cell Biology', 'Biochemistry'], ['Evolution', 'Genetics'], ['Statistics', 'Ecology'],
    ['Algorithms', 'Data Structures'], ['Operating Systems', 'Networks'],
    ['Databases', 'Algorithms'], ['Algebra', 'Statistics'],
  ];

  subjects.forEach((subject, si) => {
    nodes.push({ id: subject, label: subject, type: 'subject', size: 20, color: getSubjectColor(subject) });
    const concepts = conceptMap[subject] || [];
    concepts.forEach((concept, ci) => {
      nodes.push({ id: concept, label: concept, type: 'concept', size: 12, color: getSubjectColor(subject) + 'aa', subject });
      links.push({ source: subject, target: concept, strength: 0.8 });
    });
  });

  connections.forEach(([source, target]) => {
    if (nodes.find(n => n.id === source) && nodes.find(n => n.id === target)) {
      links.push({ source, target, strength: 0.3 });
    }
  });

  return { nodes, links };
}

function getSubjectColor(subject) {
  const colors = {
    Mathematics: '#7c3aed', 'Computer Science': '#ec4899', Physics: '#f97316',
    Biology: '#14b8a6', Chemistry: '#8b5cf6', History: '#f59e0b',
    'English Literature': '#10b981', Economics: '#06b6d4',
  };
  return colors[subject] || '#94a3b8';
}

// ============================================================
// HELPERS
// ============================================================
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


export function getLearningStyle(answers) {
  const styles = ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'];
  const scores = answers.reduce((acc, a) => { acc[a] = (acc[a] || 0) + 1; return acc; }, {});
  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const style = styles[parseInt(dominant?.[0] || 0)] || 'Visual';
  const descriptions = {
    Visual: 'You learn best through diagrams, charts, and visual representations. Use mind maps and color-coding!',
    Auditory: 'You learn best through listening and discussion. Try explaining concepts aloud and using mnemonics!',
    'Reading/Writing': 'You learn best through reading and writing. Take detailed notes and summarize in your own words!',
    Kinesthetic: 'You learn best through doing. Use hands-on practice, labs, and real-world applications!',
  };
  return { style, description: descriptions[style], tips: getStudyTips() };
}

// ============================================================
// AI FLASHCARD AUTO-GENERATOR FROM TEXT
// ============================================================
export function generateFlashcardsFromText(text, subject = 'General', count = 8) {
  if (!text || text.trim().length < 30) return [];

  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 300);

  const cards = [];

  // Pattern 1: "X is/are Y" → What is X? / Y
  const isPattern = /^(.{3,50}?)\s+(?:is|are|was|were|refers to|means|defined as)\s+(.{10,200})/i;

  // Pattern 2: "X = Y" (equations/formulas)
  const eqPattern = /^(.{2,40}?)\s*[=:]\s*(.{5,200})/;

  // Pattern 3: key terms detection
  const keyTerms = ['theorem', 'law', 'principle', 'equation', 'formula', 'concept', 'process', 'method', 'algorithm', 'definition', 'rule', 'theory'];

  sentences.forEach(sentence => {
    if (cards.length >= count) return;

    const isMatch = sentence.match(isPattern);
    if (isMatch) {
      cards.push({
        front: `What ${isMatch[0].match(/\bwere?\b|\bwas\b/i) ? 'was' : 'is'} ${isMatch[1].trim()}?`,
        back: isMatch[2].trim().replace(/\.$/, '') + '.',
      });
      return;
    }

    const eqMatch = sentence.match(eqPattern);
    if (eqMatch && eqMatch[1].length < 40) {
      cards.push({
        front: `What is the value/formula for: ${eqMatch[1].trim()}?`,
        back: eqMatch[2].trim(),
      });
      return;
    }

    const hasKeyTerm = keyTerms.some(t => sentence.toLowerCase().includes(t));
    if (hasKeyTerm && sentence.length > 40) {
      const words = sentence.split(' ');
      const pivot = Math.floor(words.length / 2);
      cards.push({
        front: `Complete: "${words.slice(0, pivot).join(' ')} ___?"`,
        back: words.slice(pivot).join(' '),
      });
    }
  });

  // Fill remaining slots with definition-style cards from full text
  const remaining = count - cards.length;
  if (remaining > 0 && sentences.length > cards.length) {
    const unused = sentences.filter((_, i) => i >= cards.length);
    unused.slice(0, remaining).forEach(s => {
      const words = s.split(' ');
      if (words.length < 6) return;
      // Pick a meaningful noun phrase as the "question"
      cards.push({
        front: `Explain: "${words.slice(0, Math.min(6, Math.floor(words.length / 2))).join(' ')}..."`,
        back: s,
      });
    });
  }

  const now = new Date().toISOString();
  return cards.slice(0, count).map(c => ({
    front: c.front,
    back: c.back,
    subject,
    difficulty: 2,
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: now,
    tags: ['ai-generated'],
  }));
}

// ============================================================
// EBBINGHAUS FORGETTING CURVE
// ============================================================
export function getEbbinghausCurve(repetitions = 0, easeFactor = 2.5) {
  // R(t) = e^(-t/S) where S = stability (days before 90% forgotten)
  // SM-2 approximate stability: 1, 6, 6*EF, 6*EF^2, ...
  const stabilities = [1, 6];
  for (let i = 2; i <= Math.max(repetitions, 5); i++) {
    stabilities.push(Math.round(stabilities[stabilities.length - 1] * easeFactor));
  }
  const S = stabilities[Math.min(repetitions, stabilities.length - 1)];

  return Array.from({ length: 30 }, (_, day) => {
    const retention = Math.round(Math.exp(-day / (S * 1.4)) * 100);
    return { day, retention: Math.max(0, retention), threshold: 70 };
  });
}

// ============================================================
// EXAM READINESS (enhanced)
// ============================================================
export function getExamReadiness(sessions, flashcards, avgScore, examDate) {
  const daysLeft = examDate
    ? Math.max(0, Math.round((new Date(examDate) - new Date()) / 86400000))
    : null;
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(c => c.repetitions >= 4).length;
  const masteryPct = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  const studyDays = new Set(sessions.map(s => s.date)).size;
  const consistencyScore = Math.min(100, studyDays * 7);
  const quizScore = avgScore || 0;
  const readiness = Math.round((masteryPct * 0.4) + (quizScore * 0.35) + (consistencyScore * 0.25));

  return {
    readiness,
    daysLeft,
    masteryPct,
    quizScore,
    consistencyScore,
    studyDays,
    masteredCards,
    totalCards,
    status: readiness >= 80 ? '🟢 Exam Ready' : readiness >= 60 ? '🟡 Getting There' : '🔴 Needs Work',
    tip: readiness >= 80
      ? 'Excellent! Focus on weak spots and get good sleep before the exam.'
      : readiness >= 60
      ? 'Good progress! Increase daily reviews and take more practice quizzes.'
      : 'Start with flashcard basics and build consistency — every day counts!',
  };
}

