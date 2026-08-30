import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Layers, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import LanguageSelector from '../components/CodeEditor/LanguageSelector';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import EditorToolbar from '../components/CodeEditor/EditorToolbar';
import LoadingAnalysis from '../components/Loading/LoadingAnalysis';
import ProviderSelector from '../components/Common/ProviderSelector';
import { defaultPythonCode } from '../data/mockData';
import { getProviders, reviewCode, compareCode, type Provider } from '../services/api';
import type { Language } from '../types';

const NewReview: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();

  const [code, setCode] = useState(defaultPythonCode);
  const [language, setLanguage] = useState<Language>('python');
  const [analysisMode, setAnalysisMode] = useState<'single' | 'compare'>('single');
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['openai', 'claude', 'gemini']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  // Load available providers on mount
  useEffect(() => {
    getProviders()
      .then((data) => {
        setProviders(data.providers);
        if (data.default) setSelectedProvider(data.default);
        const avail = data.providers.filter(p => p.available).map(p => p.id);
        if (avail.length >= 2) {
          setSelectedProviders(avail.slice(0, 3));
        }
        setBackendOnline(true);
      })
      .catch(() => {
        setBackendOnline(false);
        setError('Unable to connect to backend. Make sure Flask server is running on port 5000.');
      });
  }, []);

  const handleToggleProvider = (providerId: string) => {
    setSelectedProviders(prev => {
      if (prev.includes(providerId)) {
        return prev.filter(p => p !== providerId);
      } else {
        return [...prev, providerId];
      }
    });
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code before analyzing.');
      return;
    }
    if (!language) {
      setError('Please select a programming language.');
      return;
    }

    if (analysisMode === 'single') {
      if (!selectedProvider) {
        setError('Please select an AI provider.');
        return;
      }
    } else {
      if (selectedProviders.length < 2) {
        setError('Please select at least 2 AI providers for multi-AI comparison.');
        return;
      }
    }

    setError(null);
    setIsAnalyzing(true);
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });

    try {
      if (analysisMode === 'single') {
        const result = await reviewCode(language, code, selectedProvider);
        dispatch({ type: 'SET_CURRENT_REVIEW', payload: result });
        dispatch({ type: 'SET_CURRENT_COMPARISON', payload: null });
        navigate('/results');
      } else {
        const compResult = await compareCode(language, code, selectedProviders);
        dispatch({ type: 'SET_CURRENT_COMPARISON', payload: compResult });

        // Also wrap into review format so /results handles it uniformly
        const primaryResult = compResult.results.find((r: any) => r.provider === compResult.comparison.bestProvider && r.success)?.review;
        const normalizedReview: any = {
          id: compResult.id || Date.now(),
          title: compResult.title || `${language.toUpperCase()} Multi-AI Comparison`,
          language,
          provider: `Multi-AI (${selectedProviders.length})`,
          score: compResult.comparison.averageScore,
          summary: compResult.comparison.summary,
          bugs: primaryResult?.bugs || [],
          warnings: primaryResult?.warnings || [],
          securityIssues: primaryResult?.securityIssues || [],
          suggestions: [compResult.comparison.recommendation],
          complexity: compResult.comparison.complexityComparison as any,
          quality: primaryResult?.quality || { readability: 80, maintainability: 80, performance: 80, security: 80 },
          code,
          fixedCode: compResult.comparison.suggestedFixes?.[compResult.comparison.bestProvider || 'openai'] || '',
          analysisType: 'comparison',
          providersUsed: selectedProviders,
          comparisonResult: compResult.comparison,
          createdAt: new Date().toISOString()
        };

        dispatch({ type: 'SET_CURRENT_REVIEW', payload: normalizedReview });
        navigate('/results');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };

  const handleClear = () => {
    setCode('');
    setError(null);
  };

  const handleLoadExample = () => {
    setCode(`def calculate_average(numbers):
    total = 0

    for i in range(len(numbers) + 1):
        total += numbers[i]

    return total / len(numbers)`);
    setLanguage('python');
    setError(null);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingAnalysis />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            {analysisMode === 'compare'
              ? `Running Multi-AI comparison across ${selectedProviders.join(', ').toUpperCase()}...`
              : `Analyzing with ${selectedProvider.toUpperCase()}...`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Evaluating code quality, bug detection, complexity, and security...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">New Code Review</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Submit code for single AI review or compare multiple AI providers simultaneously.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-red-500'}`}
            title={backendOnline ? 'Backend Connected' : 'Backend Offline'}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {backendOnline ? 'Connected (v6.0)' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Analysis Mode & Config Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-5">
        {/* Mode Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Analysis Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setAnalysisMode('single')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                analysisMode === 'single'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                  : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  analysisMode === 'single' ? 'border-blue-600' : 'border-gray-400'
                }`}
              >
                {analysisMode === 'single' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
              <span>Single AI Provider</span>
            </button>

            <button
              type="button"
              onClick={() => setAnalysisMode('compare')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                analysisMode === 'compare'
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500'
                  : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  analysisMode === 'compare' ? 'border-purple-600' : 'border-gray-400'
                }`}
              >
                {analysisMode === 'compare' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                )}
              </div>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                Compare Multiple AIs
              </span>
            </button>
          </div>
        </div>

        {/* Language & Provider Selector */}
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
              mode={analysisMode === 'single' ? 'single' : 'multiple'}
              selectedProvider={selectedProvider}
              selectedProviders={selectedProviders}
              onSelectProvider={setSelectedProvider}
              onToggleProvider={handleToggleProvider}
              disabled={providers.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
          </div>
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
          onClear={handleClear}
        />
        <div className={isMaximized ? 'h-[calc(100vh-120px)]' : 'h-[400px]'}>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            height={isMaximized ? 'calc(100vh - 120px)' : '400px'}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
        <button
          onClick={handleLoadExample}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Load Buggy Example
        </button>
        <button
          onClick={handleAnalyze}
          disabled={
            isAnalyzing ||
            !code.trim() ||
            !backendOnline ||
            (analysisMode === 'compare' && selectedProviders.length < 2)
          }
          className={`flex items-center gap-2 px-6 py-2.5 font-semibold text-white rounded-lg transition-all text-sm shadow-md ${
            analysisMode === 'compare'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600'
              : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'
          } disabled:cursor-not-allowed`}
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : analysisMode === 'compare' ? (
            <Layers className="w-4 h-4" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {isAnalyzing
            ? 'Analyzing...'
            : analysisMode === 'compare'
            ? `Compare ${selectedProviders.length} AIs`
            : 'Analyze Code'}
        </button>
      </div>
    </div>
  );
};

export default NewReview;
