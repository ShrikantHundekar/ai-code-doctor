import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, RefreshCw, Trash2, AlertCircle, GitCompare, GitBranch, Layers } from 'lucide-react';
import { getReviews, deleteReview, type ReviewHistoryItem } from '../services/api';

const ReviewHistory: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [reviews, setReviews] = useState<ReviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const languages = ['all', 'python', 'javascript', 'java', 'cpp', 'csharp'];
  const providers = ['all', 'openai', 'claude', 'gemini'];
  const types = [
    { id: 'all', label: 'All Review Types' },
    { id: 'single', label: 'Single AI Reviews' },
    { id: 'comparison', label: 'Multi-AI Comparisons' }
  ];

  const loadReviews = () => {
    setLoading(true);
    getReviews(
      search,
      languageFilter !== 'all' ? languageFilter : undefined,
      providerFilter !== 'all' ? providerFilter : undefined,
      typeFilter !== 'all' ? typeFilter : undefined
    )
      .then((data) => {
        setReviews(data.reviews || []);
        setError(null);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load history');
        setReviews([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [languageFilter, providerFilter, typeFilter]);

  const filteredReviews = reviews
    .filter((review) => {
      const searchLower = search.toLowerCase();
      return !search || (
        (review.title || '').toLowerCase().includes(searchLower) ||
        (review.language || '').toLowerCase().includes(searchLower) ||
        (review.provider || '').toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sort === 'highest') return b.score - a.score;
      if (sort === 'lowest') return a.score - b.score;
      if (sort === 'oldest') return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
      return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
    });

  const handleReviewClick = (id: string | number) => {
    navigate(`/results/${id}`);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, filter, and compare past code reviews, Multi-AI analyses, and version lineages.
          </p>
        </div>

        <Link
          to="/history/compare"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <GitCompare className="w-4 h-4" />
          Compare Two Reviews
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {providers.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Providers' : p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </select>

          <button
            onClick={loadReviews}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-xs">Loading reviews...</div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && reviews.length === 0 && !error && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">No reviews recorded yet.</p>
          <Link to="/review/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs">
            + New Code Review
          </Link>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Review Title</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mode / Provider</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bugs</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    onClick={() => handleReviewClick(review.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {review.title || review.reviewName}
                        </span>
                        {review.version && review.version > 1 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <GitBranch className="w-2.5 h-2.5" /> v{review.version}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase">
                        {review.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.analysisType === 'comparison' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                          <Layers className="w-3 h-3" /> Multi-AI
                        </span>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {review.provider || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${
                        review.score >= 90 ? 'text-green-600 dark:text-green-400' :
                        review.score >= 70 ? 'text-blue-600 dark:text-blue-400' :
                        review.score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {review.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {review.bugCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {review.date ? new Date(review.date).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeleteConfirm(Number(review.id))}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        aria-label="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredReviews.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-gray-500 dark:text-gray-400">
              No reviews match your filters.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Delete Review?</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
              This review will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewHistory;