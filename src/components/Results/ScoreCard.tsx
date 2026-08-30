import React from 'react';
import { AlertTriangle, Shield, Lightbulb } from 'lucide-react';
import type { ReviewResult } from '../../types';

interface ScoreCardProps {
  review: ReviewResult;
}

const getScoreLabel = (score: number): { text: string; color: string } => {
  if (score >= 90) return { text: 'Excellent', color: 'text-green-500' };
  if (score >= 70) return { text: 'Good — Some improvements recommended', color: 'text-blue-500' };
  if (score >= 50) return { text: 'Fair — Needs attention', color: 'text-yellow-500' };
  return { text: 'Poor — Critical issues', color: 'text-red-500' };
};

const ScoreCard: React.FC<ScoreCardProps> = ({ review }) => {
  const { text: scoreText, color: scoreColor } = getScoreLabel(review.score);
  const percentage = review.score;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Score Circle */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${scoreColor} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${scoreColor}`}>{review.score}</span>
              <span className="text-xs text-gray-500 dark:text-gray-500">/ 100</span>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{review.score} / 100</h3>
            <p className={`text-sm font-medium ${scoreColor}`}>{scoreText}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Code Quality Score
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:flex gap-4">
          <div className="text-center lg:flex lg:flex-col lg:items-center lg:gap-1 px-4 py-3 lg:py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex lg:flex-col items-center lg:items-start gap-2">
              <AlertTriangle className="w-4 h-4 lg:w-5 lg.h-5 text-red-500" />
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Bugs</span>
            </div>
            <span className="text-2xl lg:text-lg font-bold text-red-600 dark:text-red-400 mt-1 lg:mt-0">{review.bugs.length}</span>
          </div>

          <div className="text-center lg:flex lg:flex-col lg:items-center lg:gap-1 px-4 py-3 lg:py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex lg:flex-col items-center lg:items-start gap-2">
              <AlertTriangle className="w-4 h-4 lg:w-5 lg.h-5 text-orange-500" />
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Warnings</span>
            </div>
            <span className="text-2xl lg:text-lg font-bold text-orange-600 dark:text-orange-400 mt-1 lg:mt-0">{review.warnings.length}</span>
          </div>

          <div className="text-center lg:flex lg:flex-col lg:items-center lg:gap-1 px-4 py-3 lg:py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex lg:flex-col items-center lg:items-start gap-2">
              <Shield className="w-4 h-4 lg:w-5 lg.h-5 text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Security</span>
            </div>
            <span className="text-2xl lg:text-lg font-bold text-blue-600 dark:text-blue-400 mt-1 lg:mt-0">{review.securityIssues.length}</span>
          </div>

          <div className="text-center lg:flex lg:flex-col lg:items-center lg:gap-1 px-4 py-3 lg:py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex lg:flex-col items-center lg:items-start gap-2">
              <Lightbulb className="w-4 h-4 lg:w-5 lg.h-5 text-purple-500" />
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Suggestions</span>
            </div>
            <span className="text-2xl lg:text-lg font-bold text-purple-600 dark:text-purple-400 mt-1 lg:mt-0">{review.suggestions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
