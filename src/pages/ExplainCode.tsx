import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import LanguageSelector from '../components/CodeEditor/LanguageSelector';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import EditorToolbar from '../components/CodeEditor/EditorToolbar';
import ProviderSelector from '../components/Common/ProviderSelector';
import { getProviders, explainCode, type Provider } from '../services/api';
import type { Language, ExplanationResult, ExplanationLevel } from '../types';

const defaultPythonCode = `def calculate_average(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total / len(numbers)`;

const ExplainCode: React.FC = () => {
  const [code, setCode] = useState(defaultPythonCode);
  const [language, setLanguage] = useState<Language>('python');
  const [level, setLevel] = useState<ExplanationLevel>('intermediate');
  const [provider, setProvider] = useState('openai');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);
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

  const handleExplain = async () => {
    if (!code.trim()) {
      setErrorMsg('Please provide code to explain.');
      return;
    }

    setErrorMsg(null);
    setIsExplaining(true);

    try {
      const res = await explainCode(language, code, level, provider);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to explain code.');
    } finally {
      setIsExplaining(false);
    }
  };

  const levelOptions: Array<{ id: ExplanationLevel; title: string; desc: string }> = [
    { id: 'beginner', title: 'Beginner', desc: 'Simple terms, plain analogies, no jargon' },
    { id: 'intermediate', title: 'Intermediate', desc: 'Control flow, patterns, idioms' },
    { id: 'advanced', title: 'Advanced', desc: 'Complexity, memory, runtime internals' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          Code Explanation
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explain Code</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Understand how code works tailored to your skill level with line-by-line annotations.
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        {/* Level Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Explanation Skill Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {levelOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLevel(opt.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  level === opt.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 text-blue-900 dark:text-blue-200'
                    : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-sm">{opt.title}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{opt.desc}</p>
              </button>
            ))}
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
          onClick={handleExplain}
          disabled={isExplaining || !code.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors text-sm shadow-md"
        >
          {isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
          {isExplaining ? 'Explaining...' : `Explain (${level.toUpperCase()})`}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Summary & Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Overview ({result.level?.toUpperCase() || level.toUpperCase()} LEVEL)
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 capitalize">
                AI: {result.provider || provider}
              </span>
            </div>

            {result.summary && (
              <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  {result.summary}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {result.explanation}
            </p>
          </div>

          {/* Line-by-Line Breakdown */}
          {((result.lineExplanations && result.lineExplanations.length > 0) || (result.steps && result.steps.length > 0)) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Step-by-Step / Line Annotations
              </h3>

              <div className="space-y-2.5">
                {(result.lineExplanations || result.steps || []).map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60 flex flex-col sm:flex-row sm:items-start gap-3"
                  >
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                      Line {step.line || idx + 1}
                    </span>
                    <div className="flex-1">
                      {step.code && (
                        <p className="font-mono text-xs text-blue-600 dark:text-blue-400 mb-1">
                          {step.code}
                        </p>
                      )}
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {step.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplainCode;
