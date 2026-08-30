import React from 'react';
import { ListOrdered, ShieldAlert, Bug, Zap, CheckCircle2 } from 'lucide-react';
import type { ImprovementPlanItem } from '../../types';

interface ImprovementPlanCardProps {
  plan: ImprovementPlanItem[];
}

const ImprovementPlanCard: React.FC<ImprovementPlanCardProps> = ({ plan }) => {
  if (!plan || plan.length === 0) return null;

  const getPriorityBadge = (p: number) => {
    switch (p) {
      case 1:
        return 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30';
      case 2:
        return 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30';
      case 3:
        return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'bug fix':
        return <Bug className="w-4 h-4 text-orange-500" />;
      case 'performance':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
          <ListOrdered className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            AI Code Improvement Plan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Prioritized remediation roadmap generated from analysis findings
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {plan.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getPriorityBadge(
                    item.priority
                  )}`}
                >
                  Priority {item.priority} — {item.priorityLabel}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {getCategoryIcon(item.category)}
                  {item.category}
                </span>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {item.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImprovementPlanCard;
