import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  storage, generateId,
  getDefaultSubjects, getDefaultProfile, getDefaultStudySessions,
  getDefaultFlashcards, getDefaultNotes, getDefaultBadges, getDefaultGoals
} from '../utils/storage';
import { calculateXP } from '../utils/ai';

// ── Context ──────────────────────────────────────────────────
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ── Initial State ────────────────────────────────────────────
function getInitialState() {
  return {
    theme: storage.get('theme', 'dark'),
    profile: storage.get('profile', getDefaultProfile()),
    subjects: storage.get('subjects', getDefaultSubjects()),
    flashcards: storage.get('flashcards', getDefaultFlashcards()),
    notes: storage.get('notes', getDefaultNotes()),
    studySessions: storage.get('studySessions', getDefaultStudySessions()),
    badges: storage.get('badges', getDefaultBadges()),
    goals: storage.get('goals', getDefaultGoals()),
    studyPlan: storage.get('studyPlan', null),
    pomodoroSettings: storage.get('pomodoroSettings', { work: 25, shortBreak: 5, longBreak: 15, sessions: 4 }),
    toasts: [],
    sidebarOpen: false,
    quizResults: storage.get('quizResults', []),
    chatHistory: storage.get('chatHistory', []),
    dailyChallenges: storage.get('dailyChallenges', getDefaultChallenges()),
    achievements: storage.get('achievements', []),
  };
}

function getDefaultChallenges() {
  return [
    { id: '1', title: 'Review 10 flashcards', target: 10, current: 0, xp: 50, type: 'flashcards', completed: false },
    { id: '2', title: 'Complete a 25-minute Pomodoro', target: 1, current: 0, xp: 75, type: 'pomodoro', completed: false },
    { id: '3', title: 'Score 80%+ on a quiz', target: 80, current: 0, xp: 100, type: 'quiz', completed: false },
    { id: '4', title: 'Create 1 new note', target: 1, current: 0, xp: 30, type: 'notes', completed: false },
  ];
}

// ── Reducer ───────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    // Theme
    case 'SET_THEME':
      return { ...state, theme: action.payload };

    // Profile
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    // XP & Level
    case 'ADD_XP': {
      const xp = state.profile.xp + action.payload;
      let level = state.profile.level;
      let newXp = xp;
      let newXpToNext = state.profile.xpToNext;
      while (newXp >= newXpToNext) {
        level += 1;
        newXp -= newXpToNext;
        newXpToNext = Math.round(newXpToNext * 1.25);
      }
      return {
        ...state,
        profile: { ...state.profile, xp: newXp, level, xpToNext: newXpToNext }
      };
    }

    // Subjects
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'UPDATE_SUBJECT':
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) };
    case 'DELETE_SUBJECT':
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };

    // Flashcards
    case 'ADD_FLASHCARD':
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case 'ADD_FLASHCARDS':
      return { ...state, flashcards: [...state.flashcards, ...action.payload] };
    case 'UPDATE_FLASHCARD':
      return { ...state, flashcards: state.flashcards.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'DELETE_FLASHCARD':
      return { ...state, flashcards: state.flashcards.filter(c => c.id !== action.payload) };

    // Notes
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? { ...n, ...action.payload } : n) };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };

    // Study Sessions
    case 'ADD_SESSION': {
      const newSessions = [action.payload, ...state.studySessions];
      const newTotalTime = state.profile.totalStudyTime + action.payload.duration;

      // Check and update streak
      const today = new Date().toISOString().split('T')[0];
      const lastDate = state.profile.lastStudyDate;
      let newStreak = state.profile.streak;
      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStreak = lastDate === yesterday ? state.profile.streak + 1 : 1;
      }

      return {
        ...state,
        studySessions: newSessions,
        profile: {
          ...state.profile,
          totalStudyTime: newTotalTime,
          cardsReviewed: state.profile.cardsReviewed + (action.payload.cardsReviewed || 0),
          streak: newStreak,
          longestStreak: Math.max(state.profile.longestStreak, newStreak),
          lastStudyDate: today,
        }
      };
    }

    // Streak
    case 'UPDATE_STREAK':
      return { ...state, profile: { ...state.profile, streak: action.payload, longestStreak: Math.max(state.profile.longestStreak, action.payload) } };

    // Increment cards reviewed (real-time)
    case 'INCREMENT_CARDS_REVIEWED':
      return {
        ...state,
        profile: { ...state.profile, cardsReviewed: state.profile.cardsReviewed + 1 }
      };

    // Badges
    case 'UNLOCK_BADGE':
      return {
        ...state,
        badges: state.badges.map(b => b.id === action.payload ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b)
      };

    // Goals
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

    // Study Plan
    case 'SET_STUDY_PLAN':
      return { ...state, studyPlan: action.payload };

    // Quiz Results
    case 'ADD_QUIZ_RESULT': {
      const allResults = [action.payload, ...state.quizResults];
      const avgScore = Math.round(allResults.reduce((a, r) => a + r.score, 0) / allResults.length);
      return {
        ...state,
        quizResults: allResults,
        profile: { ...state.profile, quizzesTaken: state.profile.quizzesTaken + 1, avgScore }
      };
    }

    // Chat
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] };

    // Pomodoro Settings
    case 'UPDATE_POMODORO':
      return { ...state, pomodoroSettings: { ...state.pomodoroSettings, ...action.payload } };

    // Daily Challenges
    case 'UPDATE_CHALLENGE':
      return { ...state, dailyChallenges: state.dailyChallenges.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };

    // Reset daily challenges (called at day change)
    case 'RESET_CHALLENGES':
      return { ...state, dailyChallenges: getDefaultChallenges() };

    // Toasts
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: generateId(), ...action.payload }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    // Sidebar
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    // Full reset (wipe localStorage and reset to defaults)
    case 'RESET_ALL':
      storage.clear();
      return getInitialState();

    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  // Persist to localStorage on state change
  useEffect(() => {
    storage.set('theme', state.theme);
    storage.set('profile', state.profile);
    storage.set('subjects', state.subjects);
    storage.set('flashcards', state.flashcards);
    storage.set('notes', state.notes);
    storage.set('studySessions', state.studySessions);
    storage.set('badges', state.badges);
    storage.set('goals', state.goals);
    storage.set('studyPlan', state.studyPlan);
    storage.set('pomodoroSettings', state.pomodoroSettings);
    storage.set('quizResults', state.quizResults);
    storage.set('chatHistory', state.chatHistory);
    storage.set('dailyChallenges', state.dailyChallenges);
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Auto-remove toasts
  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);

  // ── Action Creators ──────────────────────────────────────────
  const actions = {
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    updateProfile: (data) => dispatch({ type: 'UPDATE_PROFILE', payload: data }),

    addXP: (amount, reason) => {
      dispatch({ type: 'ADD_XP', payload: amount });
      if (amount > 0) {
        dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `+${amount} XP${reason ? ` — ${reason}` : ''}` } });
      }
    },

    addSubject: (subject) => dispatch({ type: 'ADD_SUBJECT', payload: { id: generateId(), ...subject } }),
    updateSubject: (subject) => dispatch({ type: 'UPDATE_SUBJECT', payload: subject }),
    deleteSubject: (id) => dispatch({ type: 'DELETE_SUBJECT', payload: id }),

    addFlashcard: (card) => dispatch({ type: 'ADD_FLASHCARD', payload: { id: generateId(), ...card } }),
    addFlashcards: (cards) => dispatch({ type: 'ADD_FLASHCARDS', payload: cards }),
    updateFlashcard: (card) => dispatch({ type: 'UPDATE_FLASHCARD', payload: card }),
    deleteFlashcard: (id) => dispatch({ type: 'DELETE_FLASHCARD', payload: id }),

    // Called every time a card is reviewed — updates counter + challenges + badges
    recordCardReview: (quality) => {
      dispatch({ type: 'INCREMENT_CARDS_REVIEWED' });
    },

    addNote: (note) => dispatch({ type: 'ADD_NOTE', payload: { id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...note } }),
    updateNote: (note) => dispatch({ type: 'UPDATE_NOTE', payload: { ...note, updatedAt: new Date().toISOString() } }),
    deleteNote: (id) => dispatch({ type: 'DELETE_NOTE', payload: id }),

    addSession: (session) => dispatch({ type: 'ADD_SESSION', payload: { id: generateId(), date: new Date().toISOString().split('T')[0], ...session } }),
    updateStreak: (streak) => dispatch({ type: 'UPDATE_STREAK', payload: streak }),

    unlockBadge: (id) => {
      const badge = state.badges.find(b => b.id === id && !b.unlocked);
      if (badge) {
        dispatch({ type: 'UNLOCK_BADGE', payload: id });
        dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `🏆 Badge Unlocked: ${badge.name}!` } });
        dispatch({ type: 'ADD_XP', payload: 30 });
      }
    },

    // Progress a daily challenge by amount (defaults to 1). Auto-completes and awards XP.
    progressChallenge: (type, amount = 1, scoreValue = null) => {
      const challenges = state.dailyChallenges;
      challenges.forEach(c => {
        if (c.completed) return;
        let shouldProgress = false;
        let newCurrent = c.current;

        if (type === 'flashcards' && c.type === 'flashcards') {
          newCurrent = c.current + amount;
          shouldProgress = true;
        } else if (type === 'pomodoro' && c.type === 'pomodoro') {
          newCurrent = c.current + amount;
          shouldProgress = true;
        } else if (type === 'quiz' && c.type === 'quiz' && scoreValue !== null) {
          newCurrent = Math.max(c.current, scoreValue);
          shouldProgress = true;
        } else if (type === 'notes' && c.type === 'notes') {
          newCurrent = c.current + amount;
          shouldProgress = true;
        }

        if (shouldProgress) {
          const completed = newCurrent >= c.target;
          dispatch({ type: 'UPDATE_CHALLENGE', payload: { ...c, current: newCurrent, completed } });
          if (completed && !c.completed) {
            dispatch({ type: 'ADD_XP', payload: c.xp });
            dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `🎯 Challenge Complete! +${c.xp} XP` } });
          }
        }
      });
    },

    // Check and unlock badges based on current state
    checkBadges: (updatedProfile, updatedFlashcards, updatedNotes, updatedQuizResults) => {
      const profile = updatedProfile || state.profile;
      const flashcards = updatedFlashcards || state.flashcards;
      const notes = updatedNotes || state.notes;
      const quizResults = updatedQuizResults || state.quizResults;
      const badges = state.badges;

      const toUnlock = [];
      const cardsReviewed = profile.cardsReviewed;
      const quizzesTaken = profile.quizzesTaken;
      const streak = profile.streak;
      const level = profile.level;

      if (cardsReviewed >= 1 && !badges.find(b => b.id === 'first_card')?.unlocked) toUnlock.push('first_card');
      if (cardsReviewed >= 10 && !badges.find(b => b.id === 'cards_10')?.unlocked) toUnlock.push('cards_10');
      if (cardsReviewed >= 50 && !badges.find(b => b.id === 'cards_50')?.unlocked) toUnlock.push('cards_50');
      if (cardsReviewed >= 200 && !badges.find(b => b.id === 'cards_200')?.unlocked) toUnlock.push('cards_200');
      if (cardsReviewed >= 500 && !badges.find(b => b.id === 'cards_500')?.unlocked) toUnlock.push('cards_500');
      if (cardsReviewed >= 1000 && !badges.find(b => b.id === 'cards_1000')?.unlocked) toUnlock.push('cards_1000');
      if (streak >= 3 && !badges.find(b => b.id === 'streak_3')?.unlocked) toUnlock.push('streak_3');
      if (streak >= 7 && !badges.find(b => b.id === 'streak_7')?.unlocked) toUnlock.push('streak_7');
      if (streak >= 14 && !badges.find(b => b.id === 'streak_14')?.unlocked) toUnlock.push('streak_14');
      if (streak >= 30 && !badges.find(b => b.id === 'streak_30')?.unlocked) toUnlock.push('streak_30');
      if (quizzesTaken >= 1 && quizResults.some(r => r.score === 100) && !badges.find(b => b.id === 'quiz_perfect')?.unlocked) toUnlock.push('quiz_perfect');
      if (quizzesTaken >= 5 && !badges.find(b => b.id === 'quiz_5')?.unlocked) toUnlock.push('quiz_5');
      if (quizzesTaken >= 10 && !badges.find(b => b.id === 'quiz_10')?.unlocked) toUnlock.push('quiz_10');
      if (notes.length >= 1 && !badges.find(b => b.id === 'notes_1')?.unlocked) toUnlock.push('notes_1');
      if (notes.length >= 10 && !badges.find(b => b.id === 'notes_10')?.unlocked) toUnlock.push('notes_10');
      if (level >= 5 && !badges.find(b => b.id === 'level_5')?.unlocked) toUnlock.push('level_5');
      if (level >= 10 && !badges.find(b => b.id === 'level_10')?.unlocked) toUnlock.push('level_10');

      toUnlock.forEach(id => {
        const badge = state.badges.find(b => b.id === id && !b.unlocked);
        if (badge) {
          dispatch({ type: 'UNLOCK_BADGE', payload: id });
          dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `🏆 Badge Unlocked: ${badge.name}!` } });
          dispatch({ type: 'ADD_XP', payload: 30 });
        }
      });
    },

    addGoal: (goal) => dispatch({ type: 'ADD_GOAL', payload: { id: generateId(), ...goal } }),
    updateGoal: (goal) => dispatch({ type: 'UPDATE_GOAL', payload: goal }),
    deleteGoal: (id) => dispatch({ type: 'DELETE_GOAL', payload: id }),

    setStudyPlan: (plan) => dispatch({ type: 'SET_STUDY_PLAN', payload: plan }),
    addQuizResult: (result) => dispatch({ type: 'ADD_QUIZ_RESULT', payload: { id: generateId(), date: new Date().toISOString(), ...result } }),
    addChatMessage: (msg) => dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { id: generateId(), timestamp: new Date().toISOString(), ...msg } }),
    clearChat: () => dispatch({ type: 'CLEAR_CHAT' }),
    updatePomodoro: (settings) => dispatch({ type: 'UPDATE_POMODORO', payload: settings }),
    updateChallenge: (challenge) => dispatch({ type: 'UPDATE_CHALLENGE', payload: challenge }),
    toast: (message, type = 'info') => dispatch({ type: 'ADD_TOAST', payload: { type, message } }),
    removeToast: (id) => dispatch({ type: 'REMOVE_TOAST', payload: id }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    resetAll: () => dispatch({ type: 'RESET_ALL' }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}
