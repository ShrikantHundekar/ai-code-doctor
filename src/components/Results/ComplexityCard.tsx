import React from 'react';
import { Zap } from 'lucide-react';
import type { ComplexityInfo } from '../../types';

interface ComplexityCardProps {
  complexity: ComplexityInfo;
}

const ComplexityCard: React.FC<ComplexityCardProps> = ({ complexity }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Complexity Analysis</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Time Complexity */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">
            Time Complexity
          </h4>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {complexity.time}
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            {complexity.timeExplanation}
          </p>
        </div>

        {/* Space Complexity */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Space Complexity
          </h4>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {complexity.space}
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {complexity.spaceExplanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComplexityCard;
