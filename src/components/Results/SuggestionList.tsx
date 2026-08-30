import React from 'react';
import { Lightbulb } from 'lucide-react';

interface SuggestionListProps {
  suggestions: string[];
}

const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">AI Suggestions</h3>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
              {suggestion}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionList;
