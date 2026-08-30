import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Warning } from '../../types';

interface WarningCardProps {
  warning: Warning;
}

const severityColors: Record<string, string> = {
  critical: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-blue-600 dark:text-blue-400',
  info: 'text-gray-600 dark:text-gray-400',
};

const WarningCard: React.FC<WarningCardProps> = ({ warning }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${severityColors[warning.severity]}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Line {warning.line}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          {warning.message}
        </p>
      </div>
    </div>
  );
};

export default WarningCard;
