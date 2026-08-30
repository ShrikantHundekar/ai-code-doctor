import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const ThemeToggle: React.FC = () => {
  const { state, dispatch } = useAppContext();

  return (
    <button
      onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {state.theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
