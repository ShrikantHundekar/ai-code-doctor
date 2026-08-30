import React, { useState, useEffect } from 'react';
import { Wand2, CheckSquare, Square, Loader2, AlertCircle, Copy, Check, CheckCircle2 } from 'lucide-react';
import LanguageSelector from '../components/CodeEditor/LanguageSelector';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import EditorToolbar from '../components/CodeEditor/EditorToolbar';
import ProviderSelector from '../components/Common/ProviderSelector';
import CodeComparison from '../components/Results/CodeComparison';
import { getProviders, refactorCode, type Provider } from '../services/api';
import { useClipboard } from '../hooks/useClipboard';
import type { Language, RefactorResult } from '../types';

const defaultPythonCode = `def calculate_average(numbers):
    total = 0
    for i in range(len(numbers) + 1):
        total += numbers[i]
    return total / len(numbers)`;

const RefactorCode: React.FC = () => {
  const { copy } = useClipboard();

  const [code, setCode] = useState(defaultPythonCode);
  const [language, setLanguage] = useState<Language>('python');
  const [goals, setGoals] = useState<string[]>(['readability', 'performance', 'maintainability']);
  const [provider, setProvider] = useState('openai');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [result, setResult] = useState<RefactorResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const availableGoals = [
    { id: 'readability', label: 'Readability & Clean Code' },
    { id: 'performance', label: 'Performance & Optimization' },
    { id: 'maintainability', label: 'Maintainability & Types' },
    { id: 'reduce_duplication', label: 'Reduce Duplication (DRY)' },
    { id: 'simpler_logic', label: 'Simpler Control Logic' },
  ];

  useEffect(() => {
    getProviders()
      .then((data) => {
        setProviders(data.providers);
        if (data.default) setProvider(data.default);
      })
      .catch(() => {});
  }, []);

  const handleToggleGoal = (goalId: string) => {
    setGoals(prev =>
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
  };

  const handleRefactor = async () => {
    if (!code.trim()) {
      setErrorMsg('Please provide code to refactor.');
      return;
    }
    if (goals.length === 0) {
      setErrorMsg('Please select at least one refactoring goal.');
      return;
    }

    setErrorMsg(null);
    setIsRefactoring(true);

    try {
      const res = await refactorCode(language, code, goals, provider);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to refactor code.');
    } finally {
      setIsRefactoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">
          <Wand2 className="w-4 h-4" />
          AI Code Refactoring
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Refactor Code</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Transform existing code into clean, performant, and idiomatic implementations with side-by-side diff.
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        {/* Goals selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Select Refactoring Goals
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {availableGoals.map((g) => {
              const isSelected = goals.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleToggleGoal(g.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500'
                      : 'bg-white dark:bg-gray-700/40 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{g.label}</span>
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Programming Language
            </label>
            <LanguageSelector
              value={language}
              onChange={(lang) => setLanguage(lang as Language)}
            />
          </div>

          <div>
            <ProviderSelector
              providers={providers}
              mode="single"
              selectedProvider={provider}
              onSelectProvider={setProvider}
              disabled={providers.length === 0}
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Code Editor */}
      <div className={`bg-gray-900 rounded-lg overflow-hidden ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
        <EditorToolbar
          language={language.toUpperCase()}
          lineCount={code.split('\n').length}
          charCount={code.length}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized(!isMaximized)}
          onCopy={() => navigator.clipboard.writeText(code)}
          onClear={() => setCode('')}
        />
        <div className={isMaximized ? 'h-[calc(100vh-120px)]' : 'h-[320px]'}>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            height={isMaximized ? 'calc(100vh - 120px)' : '320px'}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRefactor}
          disabled={isRefactoring || !code.trim() || goals.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-colors text-sm shadow-md shadow-purple-500/20"
        >
          {isRefactoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {isRefactoring ? 'Refactoring...' : 'Refactor Code'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Changes & Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Changes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">
                Architectural & Code Changes
              </h3>
              <div className="space-y-2">
                {result.changes.map((ch, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-purple-600 dark:text-purple-400 mr-2">
                      [{ch.type}]
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{ch.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3">
                Expected Benefits & Payoffs
              </h3>
              <div className="space-y-2">
                {result.expectedBenefits.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Before & After Diff */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Before vs After Comparison
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copy(result.refactoredCode, 'Refactored code copied!')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Refactored Code
                </button>
                <button
                  type="button"
                  onClick={() => setCode(result.refactoredCode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Apply to Editor
                </button>
              </div>
            </div>

            <CodeComparison
              originalCode={code}
              fixedCode={result.refactoredCode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RefactorCode;
