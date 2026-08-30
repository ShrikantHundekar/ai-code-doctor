import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Bug,
  BookOpen,
  Wand2,
  Shield,
  Layers,
  TrendingUp,
  AlertTriangle,
  FileText,
  Cpu,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardStats,
  getReviews,
  getProviderStats,
  type ReviewHistoryItem,
  type ProviderStats
} from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReviews: 0,
    totalBugs: 0,
    averageScore: 0,
    criticalIssues: 0,
  });
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<ReviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, reviewsData, pStats] = await Promise.all([
          getDashboardStats(),
          getReviews(),
          getProviderStats().catch(() => ({ stats: {} as ProviderStats })),
        ]);
        setStats(statsData);
        setRecentReviews(reviewsData.reviews.slice(0, 5));
        setProviderStats(pStats.stats || null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tools = [
    {
      name: 'Code Review',
      description: 'Full code review with bug detection, quality ratings, and auto-fix.',
      path: '/review/new',
      icon: Code2,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Core'
    },
    {
      name: 'Multi-AI Comparison',
      description: 'Run OpenAI, Claude, and Gemini in parallel to compare findings and agreement.',
      path: '/compare',
      icon: Layers,
      color: 'from-purple-600 to-pink-600',
      badge: 'Phase 6'
    },
    {
      name: 'Debug Code',
      description: 'Diagnose runtime errors, get root cause analysis, and receive targeted code fixes.',
      path: '/debug',
      icon: Bug,
      color: 'from-red-600 to-orange-600',
      badge: 'New'
    },
    {
      name: 'Explain Code',
      description: 'Tailored explanations with beginner, intermediate, and advanced skill levels.',
      path: '/explain',
      icon: BookOpen,
      color: 'from-cyan-600 to-blue-600',
      badge: 'New'
    },
    {
      name: 'Refactor Code',
      description: 'Transform code for readability, performance, maintainability, and clean architecture.',
      path: '/refactor',
      icon: Wand2,
      color: 'from-emerald-600 to-teal-600',
      badge: 'New'
    },
    {
      name: 'Security Scan',
      description: 'SAST vulnerability scan for injection, hardcoded secrets, and unsafe input handling.',
      path: '/security',
      icon: Shield,
      color: 'from-amber-600 to-yellow-600',
      badge: 'New'
    },
  ];

  const statCards = [
    { label: 'Total Reviews', value: stats.totalReviews.toString(), icon: FileText, color: 'bg-blue-500' },
    { label: 'Bugs Found', value: stats.totalBugs.toString(), icon: Bug, color: 'bg-red-500' },
    { label: 'Avg. Code Score', value: `${stats.averageScore}/100`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Critical Issues', value: stats.criticalIssues.toString(), icon: AlertTriangle, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white shadow-xl border border-gray-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> AI Code Doctor 6.0 Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed">
            Run multi-model reviews across OpenAI, Claude, and Gemini, analyze bugs with root cause explanation, optimize code performance, and inspect security risks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/review/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/25 text-sm"
            >
              <Code2 className="w-4 h-4" />
              New Code Review
            </Link>
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-purple-600/25 text-sm"
            >
              <Layers className="w-4 h-4" />
              Multi-AI Comparison
            </Link>
          </div>
        </div>
      </div>

      {/* Analysis Launchpad Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Analysis Tools</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Launch specialized AI diagnostic and improvement workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((t) => (
            <Link
              key={t.name}
              to={t.path}
              className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${t.color} text-white shadow-sm`}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {t.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 mt-4 group-hover:translate-x-1 transition-transform">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {loading ? '-' : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provider Performance Statistics (Historical Personal Stats) */}
      {providerStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" />
                Your AI Provider Performance History
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Summary of your personal reviews and average scores across providers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {['openai', 'claude', 'gemini', 'comparison'].map((prov) => {
              const pData = providerStats[prov] || { reviews: 0, averageScore: 0 };
              const provLabel = prov === 'comparison' ? 'Multi-AI' : prov.toUpperCase();

              return (
                <div
                  key={prov}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    {provLabel}
                  </p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-gray-900 dark:text-white">
                      {pData.averageScore > 0 ? `${pData.averageScore}/100` : 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {pData.reviews} review{pData.reviews === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Recent Analyses</h2>
          <Link
            to="/history"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
          >
            View All History →
          </Link>
        </div>

        {recentReviews.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">No reviews recorded yet.</p>
            <Link
              to="/review/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
            >
              Start first review
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mode / Provider
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bugs
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentReviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/results/${review.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {review.title || review.reviewName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 uppercase">
                        {review.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600 dark:text-gray-400 capitalize font-medium">
                        {review.analysisType === 'comparison' ? 'Multi-AI Comparison' : review.provider || '-'}
                      </span>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600 dark:text-gray-400">
                        {review.bugCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {review.date ? new Date(review.date).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
