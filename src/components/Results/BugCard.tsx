import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import type { Bug } from '../../types';

interface BugCardProps {
  bug: Bug;
}

const severityColors: Record<string, string> = {
  critical: 'border-red-600 bg-red-50 dark:bg-red-900/20',
  high: 'border-orange-600 bg-orange-50 dark:bg-orange-900/20',
  medium: 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'border-blue-600 bg-blue-50 dark:bg-blue-900/20',
  info: 'border-gray-600 bg-gray-50 dark:bg-gray-900/20',
};

const severityBadgeColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-600 text-white',
  medium: 'bg-yellow-600 text-white',
  low: 'bg-blue-600 text-white',
  info: 'bg-gray-600 text-white',
};

const BugCard: React.FC<BugCardProps> = ({ bug }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`border-l-4 ${severityColors[bug.severity]} rounded-lg p-4 mb-3 transition-all duration-200`}
    >
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            bug.severity === 'critical' ? 'text-red-600' :
            bug.severity === 'high' ? 'text-orange-600' :
            bug.severity === 'medium' ? 'text-yellow-600' :
            bug.severity === 'low' ? 'text-blue-600' : 'text-gray-600'
          }`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                {bug.title}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityBadgeColors[bug.severity]}`}>
                {bug.severity.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Line {bug.line}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {bug.description}
            </p>
          </div>
        </div>
        <button className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 pl-8">
          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Problematic Code:
            </h5>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{bug.problematicCode}</code>
            </pre>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Suggested Fix:
            </h5>
            <pre className="bg-green-900/20 text-green-800 dark:text-green-200 p-3 rounded-lg text-xs overflow-x-auto border border-green-600/30">
              <code>{bug.suggestedFix}</code>
            </pre>
          </div>

          <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Apply Fix
          </button>
        </div>
      )}
    </div>
  );
};

export default BugCard;
