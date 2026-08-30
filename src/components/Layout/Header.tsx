import React from 'react';
import { Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import ThemeToggle from '../Common/ThemeToggle';

const Header: React.FC = () => {
  const { dispatch } = useAppContext();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            AI Code Doctor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-Powered Code Review & Debugging
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          JD
        </div>
      </div>
    </header>
  );
};

export default Header;
