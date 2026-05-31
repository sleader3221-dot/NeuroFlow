import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
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
    { id: '2', title: 'Complete a 25-minute study session', target: 1, current: 0, xp: 75, type: 'pomodoro', completed: false },
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
      const xpToNext = state.profile.xpToNext;
      let level = state.profile.level;
      let newXp = xp;
      let newXpToNext = xpToNext;
      if (xp >= xpToNext) {
        level += 1;
        newXp = xp - xpToNext;
        newXpToNext = Math.round(xpToNext * 1.2);
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
    case 'ADD_SESSION':
      return {
        ...state,
        studySessions: [action.payload, ...state.studySessions],
        profile: {
          ...state.profile,
          totalStudyTime: state.profile.totalStudyTime + action.payload.duration,
          cardsReviewed: state.profile.cardsReviewed + (action.payload.cardsReviewed || 0),
        }
      };

    // Streak
    case 'UPDATE_STREAK':
      return { ...state, profile: { ...state.profile, streak: action.payload, longestStreak: Math.max(state.profile.longestStreak, action.payload) } };

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
    case 'ADD_QUIZ_RESULT':
      return {
        ...state,
        quizResults: [action.payload, ...state.quizResults],
        profile: { ...state.profile, quizzesTaken: state.profile.quizzesTaken + 1 }
      };

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

    // Toasts
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: generateId(), ...action.payload }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    // Sidebar
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

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

  // Action creators
  const actions = {
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    updateProfile: (data) => dispatch({ type: 'UPDATE_PROFILE', payload: data }),
    addXP: (amount, reason) => {
      dispatch({ type: 'ADD_XP', payload: amount });
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `+${amount} XP${reason ? ` — ${reason}` : ''}` } });
    },
    addSubject: (subject) => dispatch({ type: 'ADD_SUBJECT', payload: { id: generateId(), ...subject } }),
    updateSubject: (subject) => dispatch({ type: 'UPDATE_SUBJECT', payload: subject }),
    deleteSubject: (id) => dispatch({ type: 'DELETE_SUBJECT', payload: id }),
    addFlashcard: (card) => dispatch({ type: 'ADD_FLASHCARD', payload: { id: generateId(), ...card } }),
    addFlashcards: (cards) => dispatch({ type: 'ADD_FLASHCARDS', payload: cards }),
    updateFlashcard: (card) => dispatch({ type: 'UPDATE_FLASHCARD', payload: card }),
    deleteFlashcard: (id) => dispatch({ type: 'DELETE_FLASHCARD', payload: id }),
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
        actions.addXP(30, 'Badge unlocked');
      }
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
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}
