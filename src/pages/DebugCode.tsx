import React, { useState, useEffect } from 'react';
import { Bug, Copy, Wand2, Loader2, AlertCircle } from 'lucide-react';
import LanguageSelector from '../components/CodeEditor/LanguageSelector';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import EditorToolbar from '../components/CodeEditor/EditorToolbar';
import ProviderSelector from '../components/Common/ProviderSelector';
import CodeComparison from '../components/Results/CodeComparison';
import { getProviders, debugCode, type Provider } from '../services/api';
import { useClipboard } from '../hooks/useClipboard';
import type { Language, DebugResult } from '../types';

const defaultBuggyPython = `def calculate_average(numbers):
    total = 0

    for i in range(len(numbers) + 1):
        total += numbers[i]

    return total / len(numbers)`;

const DebugCode: React.FC = () => {
  const { copy } = useClipboard();

  const [code, setCode] = useState(defaultBuggyPython);
  const [language, setLanguage] = useState<Language>('python');
  const [errorInput, setErrorInput] = useState('IndexError: list index out of range at line 5');
  const [stackTrace, setStackTrace] = useState('Traceback (most recent call last):\n  File "main.py", line 5, in calculate_average\n    total += numbers[i]\nIndexError: list index out of range');
  const [provider, setProvider] = useState('openai');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    getProviders()
      .then((data) => {
        setProviders(data.providers);
        if (data.default) setProvider(data.default);
      })
      .catch(() => {});
  }, []);

  const handleDebug = async () => {
    if (!code.trim()) {
      setErrorMsg('Please provide code to debug.');
      return;
    }
    if (!errorInput.trim()) {
      setErrorMsg('Please provide the error message you encountered.');
      return;
    }

    setErrorMsg(null);
    setIsDebugging(true);

    try {
      const res = await debugCode(language, code, errorInput, stackTrace, provider);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Debugging request failed.');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleApplyFix = () => {
    if (result?.fixedCode) {
      setCode(result.fixedCode);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
          <Bug className="w-4 h-4" />
          Advanced AI Debugging
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Debug My Code</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Provide your code, error message, and optional stack trace for AI-powered root cause analysis and resolution.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Error Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Error Message <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={errorInput}
            onChange={(e) => setErrorInput(e.target.value)}
            placeholder="e.g. IndexError: list index out of range"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Stack Trace Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Stack Trace <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={stackTrace}
            onChange={(e) => setStackTrace(e.target.value)}
            rows={3}
            placeholder="Paste stack trace if available..."
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
          />
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleDebug}
          disabled={isDebugging || !code.trim() || !errorInput.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors text-sm shadow-md shadow-red-500/20"
        >
          {isDebugging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
          {isDebugging ? 'Debugging...' : 'Debug Code'}
        </button>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Root Cause */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Root Cause
              </h3>
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                {result.rootCause}
              </p>
            </div>

            {/* Error Explanation */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Why It Happened
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.errorExplanation}
              </p>
            </div>
          </div>

          {/* Solution */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Suggested Fix
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
              {result.solution}
            </p>

            {/* Changes List */}
            {result.changes && result.changes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Changes Made:
                </h4>
                <div className="space-y-1.5">
                  {result.changes.map((ch, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{ch}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Diff / Comparison */}
          {result.fixedCode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  Code Comparison (Before vs Fixed)
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copy(result.fixedCode, 'Fixed code copied!')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Fix
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFix}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Apply Fix to Editor
                  </button>
                </div>
              </div>

              <CodeComparison originalCode={code} fixedCode={result.fixedCode} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugCode;
