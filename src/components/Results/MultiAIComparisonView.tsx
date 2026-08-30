import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Bug,
  Cpu,
  Layers,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  XCircle,
  Clock
} from 'lucide-react';
import type { ComparisonResult } from '../../types';
import { useClipboard } from '../../hooks/useClipboard';

interface MultiAIComparisonViewProps {
  comparisonData: ComparisonResult;
  onApplyFix?: (fixedCode: string, providerName: string) => void;
}

const MultiAIComparisonView: React.FC<MultiAIComparisonViewProps> = ({
  comparisonData,
  onApplyFix,
}) => {
  const { copy } = useClipboard();
  const { results, comparison } = comparisonData;
  const [selectedFixProvider, setSelectedFixProvider] = useState<string>(
    comparison.bestProvider || (results.find(r => r.success)?.provider || 'openai')
  );
  const [expandedBugIdx, setExpandedBugIdx] = useState<number | null>(null);
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [pendingFixCode, setPendingFixCode] = useState<{ code: string; provider: string } | null>(null);

  const successfulResults = results.filter((r) => r.success);
  const failedResults = results.filter((r) => !r.success);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500 dark:text-green-400 bg-green-500/10 border-green-500/30';
    if (score >= 70) return 'text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (score >= 50) return 'text-yellow-500 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-500 dark:text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30';
      case 'medium':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30';
    }
  };

  const handleOpenFixModal = (code: string, provider: string) => {
    setPendingFixCode({ code, provider });
    setFixModalOpen(true);
  };

  const handleConfirmApplyFix = () => {
    if (pendingFixCode && onApplyFix) {
      onApplyFix(pendingFixCode.code, pendingFixCode.provider);
    }
    setFixModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Partial Failures Banner */}
      {failedResults.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">Partial Multi-AI Status</p>
            <p>
              {failedResults.map((f) => `${f.provider.toUpperCase()} (${f.error || 'Unavailable'})`).join(', ')}.
              {' '}The comparison was successfully synthesized using the remaining {successfulResults.length} provider(s).
            </p>
          </div>
        </div>
      )}

      {/* Top Section: Recommended Provider & AI Agreement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Provider */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-900/40 via-indigo-900/20 to-purple-900/40 rounded-xl border border-blue-500/30 p-6 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Award className="w-4 h-4" />
            Recommended AI Provider
          </div>
          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            <h2 className="text-3xl font-extrabold text-white capitalize">
              {comparison.bestProvider || 'Consensus'}
            </h2>
            {comparison.bestScore !== undefined && (
              <span className="text-xl font-bold text-blue-300">
                {comparison.bestScore}/100 Score
              </span>
            )}
          </div>
          <div className="bg-black/30 rounded-lg p-3.5 border border-white/10">
            <p className="text-xs font-semibold text-gray-300 mb-1">Why this provider was recommended:</p>
            <p className="text-sm text-gray-200 leading-relaxed">
              {comparison.recommendation}
            </p>
          </div>
        </div>

        {/* AI Agreement Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Agreement
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {successfulResults.length} Providers
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {comparison.agreementPercentage}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">consensus</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${comparison.agreementPercentage}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Composite agreement across bug identification, security evaluation, and quality ratings.
          </p>
        </div>
      </div>

      {/* Provider Score & Metrics Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {results.map((res) => {
          const isBest = res.provider === comparison.bestProvider;
          const score = res.review?.score || 0;
          const bugCount = res.review?.bugs?.length || 0;
          const secCount = res.review?.securityIssues?.length || 0;

          return (
            <div
              key={res.provider}
              className={`rounded-xl border p-5 transition-all ${
                !res.success
                  ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 opacity-60'
                  : isBest
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-gray-900 dark:text-white capitalize">
                    {res.provider}
                  </span>
                </div>
                {res.success ? (
                  isBest ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white">
                      Best Match
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-green-500 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                    <XCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                )}
              </div>

              {res.success && res.review ? (
                <>
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Quality Score</span>
                    <span
                      className={`text-2xl font-black px-2.5 py-0.5 rounded-lg border ${getScoreColor(
                        score
                      )}`}
                    >
                      {score}
                      <span className="text-xs font-normal opacity-70">/100</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 dark:border-gray-700/60 pt-3">
                    <div className="bg-gray-50 dark:bg-gray-700/40 p-2 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">Bugs Detected</p>
                      <p className="text-base font-bold text-gray-800 dark:text-white mt-0.5">
                        {bugCount}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/40 p-2 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">Security Items</p>
                      <p className="text-base font-bold text-gray-800 dark:text-white mt-0.5">
                        {secCount}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  {res.error || 'Provider did not respond'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complexity Comparison with Disagreement Warning */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Algorithmic Complexity Comparison
            </h3>
          </div>
          {comparison.complexityComparison?.disagreement ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" /> Disagreement Detected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30">
              <Check className="w-3.5 h-3.5" /> Providers Agree
            </span>
          )}
        </div>

        {comparison.complexityComparison?.disagreement && (
          <div className="mb-4 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            {comparison.complexityComparison.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {successfulResults.map((r) => {
            const tc = comparison.complexityComparison?.timeComplexity?.[r.provider] || 'O(n)';
            const sc = comparison.complexityComparison?.spaceComplexity?.[r.provider] || 'O(1)';

            return (
              <div
                key={r.provider}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 capitalize mb-2">
                  {r.provider}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Time Complexity:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {tc}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Space Complexity:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {sc}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bug Agreement & Cross-Model Issue Confidence */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bug className="w-5 h-5 text-orange-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Cross-Model Bug Agreement & Confidence
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Issues detected independently across multiple AI providers
            </p>
          </div>
        </div>

        {comparison.bugClusters && comparison.bugClusters.length > 0 ? (
          <div className="space-y-3">
            {comparison.bugClusters.map((cluster, idx) => {
              const isExpanded = expandedBugIdx === idx;

              return (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50/50 dark:bg-gray-800/40"
                >
                  <div
                    onClick={() => setExpandedBugIdx(isExpanded ? null : idx)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getConfidenceBadge(
                            cluster.confidenceLevel
                          )}`}
                        >
                          {cluster.confidence}
                        </span>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          Line {cluster.line}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {cluster.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {cluster.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        {cluster.detectedBy.map((pname) => (
                          <span
                            key={pname}
                            title={`Detected by ${pname}`}
                            className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-800 capitalize"
                          >
                            {pname[0]}
                          </span>
                        ))}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && cluster.explanations && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 space-y-2 text-xs">
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        Provider Specific Explanations:
                      </p>
                      {cluster.explanations.map((exp, eidx) => (
                        <div
                          key={eidx}
                          className="p-2.5 rounded bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700"
                        >
                          <span className="font-bold capitalize text-blue-600 dark:text-blue-400">
                            {exp.provider}:{' '}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {exp.explanation || exp.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
            No critical bugs identified across selected AI providers.
          </div>
        )}
      </div>

      {/* Suggested Fixes by Provider */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Multi-AI Suggested Fixes
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Compare and select which AI fix to apply
              </p>
            </div>
          </div>

          {/* Provider Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-lg">
            {successfulResults.map((r) => (
              <button
                key={r.provider}
                type="button"
                onClick={() => setSelectedFixProvider(r.provider)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                  selectedFixProvider === r.provider
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {r.provider} {r.provider === comparison.bestProvider ? '★' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Fix Viewer & Actions */}
        {comparison.suggestedFixes?.[selectedFixProvider] ? (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-200 overflow-x-auto max-h-96">
              <pre>{comparison.suggestedFixes[selectedFixProvider]}</pre>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Generated by <strong className="capitalize text-gray-700 dark:text-gray-200">{selectedFixProvider}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copy(
                      comparison.suggestedFixes[selectedFixProvider],
                      `${selectedFixProvider.toUpperCase()} fix copied!`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Fix
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenFixModal(
                      comparison.suggestedFixes[selectedFixProvider],
                      selectedFixProvider
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Use {selectedFixProvider.toUpperCase()} Fix
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">
            No fixed code available for {selectedFixProvider}.
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      {fixModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Apply AI Suggested Fix?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This will replace the editor code with the solution suggested by{' '}
              <strong className="capitalize">{pendingFixCode?.provider}</strong>.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFixModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApplyFix}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Yes, Apply Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiAIComparisonView;
