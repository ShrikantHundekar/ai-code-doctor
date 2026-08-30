import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ThemeToggle from '../components/Common/ThemeToggle';

const Settings: React.FC = () => {
  const { state, dispatch } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure your editor and analysis preferences</p>
        </div>
      </div>

      {/* Editor Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Editor Settings</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Font Size</label>
            <input
              type="range"
              min="10"
              max="24"
              value={state.editorFontSize}
              onChange={(e) => dispatch({ type: 'SET_EDITOR_FONT_SIZE', payload: Number(e.target.value) })}
              className="w-full sm:w-48"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 w-12">{state.editorFontSize}px</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Tab Size</label>
            <select
              value={state.editorTabSize}
              onChange={(e) => dispatch({ type: 'SET_EDITOR_TAB_SIZE', payload: Number(e.target.value) })}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Word Wrap</label>
            <button
              onClick={() => dispatch({ type: 'SET_EDITOR_WORD_WRAP', payload: !state.editorWordWrap })}
              className={"px-4 py-2 rounded-lg text-sm font-medium " + (state.editorWordWrap ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300")}
            >
              {state.editorWordWrap ? "On" : "Off"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Auto Indent</label>
            <button
              onClick={() => dispatch({ type: 'SET_EDITOR_AUTO_INDENT', payload: !state.editorAutoIndent })}
              className={"px-4 py-2 rounded-lg text-sm font-medium " + (state.editorAutoIndent ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300")}
            >
              {state.editorAutoIndent ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between dark and light mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Analysis Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Analysis Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Security Analysis</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Include security vulnerability checks</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_SHOW_SECURITY', payload: !state.showSecurity })}
              className={"w-11 h-6 rounded-full transition-colors " + (state.showSecurity ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600")}
            >
              <div className={"w-5 h-5 bg-white rounded-full shadow transform transition-transform " + (state.showSecurity ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Complexity</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Show time and space complexity analysis</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_SHOW_COMPLEXITY', payload: !state.showComplexity })}
              className={"w-11 h-6 rounded-full transition-colors " + (state.showComplexity ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600")}
            >
              <div className={"w-5 h-5 bg-white rounded-full shadow transform transition-transform " + (state.showComplexity ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Suggestions</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Show AI improvement suggestions</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: !state.showSuggestions })}
              className={"w-11 h-6 rounded-full transition-colors " + (state.showSuggestions ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600")}
            >
              <div className={"w-5 h-5 bg-white rounded-full shadow transform transition-transform " + (state.showSuggestions ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
