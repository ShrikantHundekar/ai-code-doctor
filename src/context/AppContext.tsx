import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, AppAction } from '../types';
import { mockReviewHistory } from '../data/mockData';

const initialState: AppState = {
  theme: 'dark',
  sidebarOpen: true,
  currentReview: null,
  currentComparison: null,
  reviewHistory: [],
  isAnalyzing: false,
  editorFontSize: 14,
  editorTabSize: 2,
  editorWordWrap: true,
  editorAutoIndent: true,
  showSecurity: true,
  showComplexity: true,
  showSuggestions: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME': return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR': return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR': return { ...state, sidebarOpen: action.payload };
    case 'SET_CURRENT_REVIEW': return { ...state, currentReview: action.payload };
    case 'SET_CURRENT_COMPARISON': return { ...state, currentComparison: action.payload };
    case 'SET_REVIEW_HISTORY': return { ...state, reviewHistory: action.payload };
    case 'ADD_TO_HISTORY': return { ...state, reviewHistory: [action.payload, ...state.reviewHistory] };
    case 'SET_IS_ANALYZING': return { ...state, isAnalyzing: action.payload };
    case 'SET_EDITOR_FONT_SIZE': return { ...state, editorFontSize: action.payload };
    case 'SET_EDITOR_TAB_SIZE': return { ...state, editorTabSize: action.payload };
    case 'SET_EDITOR_WORD_WRAP': return { ...state, editorWordWrap: action.payload };
    case 'SET_EDITOR_AUTO_INDENT': return { ...state, editorAutoIndent: action.payload };
    case 'SET_SHOW_SECURITY': return { ...state, showSecurity: action.payload };
    case 'SET_SHOW_COMPLEXITY': return { ...state, showComplexity: action.payload };
    case 'SET_SHOW_SUGGESTIONS': return { ...state, showSuggestions: action.payload };
    case 'LOAD_SETTINGS': return { ...state, ...action.payload };
    default: return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_REVIEW_HISTORY', payload: mockReviewHistory });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
