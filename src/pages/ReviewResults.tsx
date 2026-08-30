import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  Wand2,
  Cpu,
  GitBranch,
  Layers,
  History
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useClipboard } from '../hooks/useClipboard';
import { getReview, getReviewVersions, type ReviewResult } from '../services/api';
import ScoreCard from '../components/Results/ScoreCard';
import BugCard from '../components/Results/BugCard';
import WarningCard from '../components/Results/WarningCard';
import SecuritySection from '../components/Results/SecuritySection';
import ComplexityCard from '../components/Results/ComplexityCard';
import SuggestionList from '../components/Results/SuggestionList';
import CodeComparison from '../components/Results/CodeComparison';
import ImprovementPlanCard from '../components/Results/ImprovementPlanCard';
import MultiAIComparisonView from '../components/Results/MultiAIComparisonView';
import QualityMetricsView from '../components/Results/QualityMetrics';

const ReviewResults: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const { copy } = useClipboard();
  const { id } = useParams<{ id?: string }>();
  const [review, setReview] = useState<ReviewResult | null>(state.currentReview);
  const [versions, setVersions] = useState<ReviewResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // Fetch review by id if route has an id parameter
  useEffect(() => {
    if (id) {
      setLoading(true);
      getReview(id)
        .then((data) => {
          const normalized: ReviewResult = {
            ...data,
            id: data.id?.toString() || id,
            reviewName: data.title || data.reviewName || 'Review',
            codeLines: data.code?.split('\n').length || 0,
            originalCode: data.code,
            qualityMetrics: data.quality,
            bugs: data.bugs || [],
            warnings: data.warnings || [],
            securityIssues: data.securityIssues || [],
            suggestions: data.suggestions || [],
            complexity: data.complexity || { time: 'N/A', space: 'N/A', explanation: '' },
            quality: data.quality || { readability: 0, maintainability: 0, performance: 0, security: 0 },
            fixedCode: data.fixedCode || '',
            analysisType: data.analysisType || 'single',
            providersUsed: data.providersUsed || [],
            comparisonResult: data.comparisonResult || null,
            parentReviewId: data.parentReviewId || null,
            version: data.version || 1,
            improvementPlan: data.improvementPlan || [],
            createdAt: data.createdAt || '',
            language: data.language || 'python',
            score: data.score || 0,
          };
          setReview(normalized);
          dispatch({ type: 'SET_CURRENT_REVIEW', payload: normalized });

          // Fetch version history if available
          getReviewVersions(id)
            .then((vData) => {
              if (vData?.versions?.length > 1) {
                setVersions(vData.versions);
              }
            })
            .catch(() => {});
        })
        .catch((err) => {
          setError(err.message || 'Review not found');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAnalyzeNextVersion = () => {
    if (!review) return;
    // Navigate to new review with fixed code pre-filled and parent review tracking
    navigate('/review/new', {
      state: {
        code: review.fixedCode || review.code,
        language: review.language,
        parentReviewId: review.id,
        version: (review.version || 1) + 1
      }
    });
  };

  const handleApplyFixAndAnalyze = (fixedCode: string) => {
    if (!review) return;
    navigate('/review/new', {
      state: {
        code: fixedCode,
        language: review.language,
        parentReviewId: review.id,
        version: (review.version || 1) + 1
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500 dark:text-gray-400">Loading review results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Review Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to History
        </Link>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">No Review Results</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Please analyze some code first to see results.</p>
        <Link
          to="/review/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Start New Review
        </Link>
      </div>
    );
  }

  const isComparison = review.analysisType === 'comparison' || Boolean(review.comparisonResult) || Boolean(state.currentComparison);
  const provider = review.provider || 'AI Doctor';
  const model = review.model || '';
  const summary = review.summary || '';
  const quality = review.quality || review.qualityMetrics;
  const complexity = review.complexity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase">
              {review.language || 'Unknown'}
            </span>

            {isComparison ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                <Layers className="w-3.5 h-3.5" /> Multi-AI Comparison
              </span>
            ) : (
              provider && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">
                  <Cpu className="w-3 h-3" /> {provider}
                </span>
              )
            )}

            {review.version && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <GitBranch className="w-3 h-3" /> v{review.version}
              </span>
            )}

            {model && (
              <span className="text-xs text-gray-400 dark:text-gray-500">Model: {model}</span>
            )}
            <span>•</span>
            <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Today'}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isComparison ? 'Multi-AI Comparison Results' : 'Code Review Results'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {review.reviewName || review.title || 'Analysis Report'}
          </p>
          {summary && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-3xl">{summary}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>

          <button
            onClick={handleAnalyzeNextVersion}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analyze Again (v{(review.version || 1) + 1})
          </button>

          {review.fixedCode && (
            <>
              <button
                onClick={() => copy(review.fixedCode || '', 'Fixed code copied to clipboard!')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Fixed Code
              </button>

              <button
                onClick={() => setApplyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-colors text-xs shadow-md shadow-purple-500/20"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Apply AI Fix
              </button>
            </>
          )}
        </div>
      </div>

      {/* Version Progression Timeline (if multiple versions exist) */}
      {versions.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <History className="w-4 h-4 text-blue-500" />
            Code Quality Version Timeline
          </div>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {versions.map((ver) => (
              <Link
                key={ver.id}
                to={`/results/${ver.id}`}
                className={`flex-shrink-0 p-3 rounded-lg border text-xs transition-all ${
                  String(ver.id) === String(review.id)
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">Version {ver.version || 1}</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{ver.score}/100</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{ver.createdAt ? new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Render Multi-AI Comparison View if Comparison Mode */}
      {isComparison && (review.comparisonResult || state.currentComparison) ? (
        <MultiAIComparisonView
          comparisonData={
            state.currentComparison || {
              mode: 'comparison',
              language: review.language || 'python',
              results: (review.providersUsed || ['openai', 'claude']).map((p: string) => ({
                provider: p,
                model: `${p}-model`,
                success: true,
                review: {
                  score: review.score || 80,
                  bugs: review.bugs || [],
                  warnings: review.warnings || [],
                  securityIssues: review.securityIssues || [],
                  suggestions: review.suggestions || [],
                  complexity: review.complexity || { time: 'O(n)', space: 'O(1)' },
                  quality: review.quality || { readability: 80, maintainability: 80, performance: 80, security: 80 },
                  fixedCode: review.fixedCode || ''
                }
              })),
              comparison: review.comparisonResult || {
                bestProvider: review.providersUsed?.[0] || 'openai',
                recommendation: review.summary || 'Selected based on multi-AI review consensus.',
                averageScore: review.score || 80,
                agreement: 0.85,
                agreementPercentage: 85,
                summary: review.summary || 'Multi-AI analysis complete.',
                bugClusters: [],
                complexityComparison: { timeComplexity: {}, spaceComplexity: {}, disagreement: false },
                scoreComparison: {},
                bugCountComparison: {},
                securityComparison: {},
                suggestedFixes: { [review.provider || 'openai']: review.fixedCode || '' }
              }
            }
          }
          onApplyFix={handleApplyFixAndAnalyze}
        />
      ) : (
        /* Render Standard Single Review Breakdown */
        <>
          <ScoreCard review={review} />

          {/* AI Improvement Plan */}
          {review.improvementPlan && review.improvementPlan.length > 0 && (
            <ImprovementPlanCard plan={review.improvementPlan} />
          )}

          {/* Bugs */}
          {review.bugs && review.bugs.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                🐛 Bugs ({review.bugs.length})
              </h3>
              <div className="space-y-3">
                {review.bugs.map((bug: any, idx: number) => (
                  <BugCard key={bug.id || idx} bug={bug} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="text-lg font-medium">No bugs detected</span>
              </div>
            </div>
          )}

          {/* Warnings */}
          {review.warnings && review.warnings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                ⚠️ Warnings ({review.warnings.length})
              </h3>
              <div className="space-y-3">
                {review.warnings.map((warning: any, idx: number) => (
                  <WarningCard key={warning.id || idx} warning={warning} />
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {state.showSecurity && (
            <SecuritySection issues={review.securityIssues || []} />
          )}

          {/* Complexity */}
          {state.showComplexity && complexity && (
            <ComplexityCard
              complexity={{
                time: complexity.time || 'O(n)',
                timeExplanation: complexity.timeExplanation || complexity.explanation || 'Processes elements in linear time.',
                space: complexity.space || 'O(1)',
                spaceExplanation: complexity.spaceExplanation || 'No extra dynamic memory proportional to input size is allocated.'
              }}
            />
          )}

          {/* Quality Metrics */}
          <QualityMetricsView metrics={quality || { readability: 0, maintainability: 0, performance: 0, security: 0 }} />

          {/* AI Suggestions */}
          {state.showSuggestions && (
            <SuggestionList suggestions={review.suggestions || []} />
          )}

          {/* Code Comparison (Diff) */}
          {(review.fixedCode || review.originalCode) && (
            <CodeComparison
              originalCode={review.originalCode || review.code || ''}
              fixedCode={review.fixedCode || review.code || ''}
            />
          )}
        </>
      )}

      {/* Apply AI Fix Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Apply AI Fix to Editor?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This will load the corrected code into the review editor as <strong>Version {(review.version || 1) + 1}</strong>, allowing you to verify that the score improves.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setApplyModalOpen(false);
                  handleApplyFixAndAnalyze(review.fixedCode || review.code || '');
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Apply Fix & Re-Analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewResults;