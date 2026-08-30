import React, { useState, useEffect } from 'react';
import { GitCompare, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { getReviews, compareReviews, type ReviewHistoryItem } from '../services/api';
import CodeComparison from '../components/Results/CodeComparison';

const CompareReviews: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<ReviewHistoryItem[]>([]);
  const [selectedId1, setSelectedId1] = useState<number | ''>('');
  const [selectedId2, setSelectedId2] = useState<number | ''>('');
  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getReviews()
      .then((data) => {
        setReviewsList(data.reviews || []);
        if (data.reviews && data.reviews.length >= 2) {
          setSelectedId1(Number(data.reviews[1].id));
          setSelectedId2(Number(data.reviews[0].id));
        }
      })
      .catch(() => {});
  }, []);

  const handleCompare = async () => {
    if (!selectedId1 || !selectedId2) {
      setErrorMsg('Please select both reviews to compare.');
      return;
    }
    if (selectedId1 === selectedId2) {
      setErrorMsg('Please select two distinct reviews or versions to compare.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await compareReviews(Number(selectedId1), Number(selectedId2));
      setComparison(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to compare selected reviews.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
          <GitCompare className="w-4 h-4" />
          Review Comparison
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compare Reviews & Versions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Measure code quality improvements and track metric deltas across different reviews or versions.
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Review A */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Base Review (Review A / Before)
            </label>
            <select
              value={selectedId1}
              onChange={(e) => setSelectedId1(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a review...</option>
              {reviewsList.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} — {r.title || r.reviewName || 'Review'} (Score: {r.score}/100)
                </option>
              ))}
            </select>
          </div>

          {/* Review B */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Target Review (Review B / After)
            </label>
            <select
              value={selectedId2}
              onChange={(e) => setSelectedId2(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a review...</option>
              {reviewsList.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} — {r.title || r.reviewName || 'Review'} (Score: {r.score}/100)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleCompare}
            disabled={loading || !selectedId1 || !selectedId2}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors text-sm shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
            {loading ? 'Comparing...' : 'Compare Reviews'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6 pt-2">
          {/* Score Delta Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Review A Score
              </span>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">
                {comparison.reviewA?.score || 0}
                <span className="text-xs font-normal opacity-70">/100</span>
              </p>
              <p className="text-xs text-gray-400 mt-1 truncate">{comparison.reviewA?.title}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Review B Score
              </span>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">
                {comparison.reviewB?.score || 0}
                <span className="text-xs font-normal opacity-70">/100</span>
              </p>
              <p className="text-xs text-gray-400 mt-1 truncate">{comparison.reviewB?.title}</p>
            </div>

            <div
              className={`rounded-xl p-5 border shadow-sm text-center flex flex-col justify-center ${
                comparison.delta?.score >= 0
                  ? 'bg-green-50/50 dark:bg-green-950/20 border-green-500/30'
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-500/30'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Score Delta
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {comparison.delta?.score >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
                <span
                  className={`text-3xl font-black ${
                    comparison.delta?.score >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {comparison.delta?.score >= 0 ? `+${comparison.delta.score}` : comparison.delta.score}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {comparison.delta?.score >= 0 ? 'Quality improved' : 'Score decreased'}
              </p>
            </div>
          </div>

          {/* Deltas Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                Bugs Delta
              </span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {comparison.delta?.bugs > 0 ? `+${comparison.delta.bugs}` : comparison.delta?.bugs || 0}
              </p>
              <p className="text-[11px] text-gray-400">
                {comparison.reviewA?.bugs?.length || 0} → {comparison.reviewB?.bugs?.length || 0} bugs
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                Security Issues Delta
              </span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {comparison.delta?.security > 0 ? `+${comparison.delta.security}` : comparison.delta?.security || 0}
              </p>
              <p className="text-[11px] text-gray-400">
                {comparison.reviewA?.securityIssues?.length || 0} → {comparison.reviewB?.securityIssues?.length || 0} issues
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                Maintainability Delta
              </span>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {comparison.delta?.quality?.maintainability >= 0
                  ? `+${comparison.delta.quality.maintainability}`
                  : comparison.delta?.quality?.maintainability || 0}
              </p>
              <p className="text-[11px] text-gray-400">Quality metric shift</p>
            </div>
          </div>

          {/* Code Diff */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Code Difference (Review A vs Review B)
            </h3>
            <CodeComparison
              originalCode={comparison.reviewA?.code || ''}
              fixedCode={comparison.reviewB?.code || ''}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareReviews;
