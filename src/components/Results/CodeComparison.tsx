import React from 'react';
import { Copy } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface CodeComparisonProps {
  originalCode: string;
  fixedCode: string;
}

const CodeComparison: React.FC<CodeComparisonProps> = ({ originalCode, fixedCode }) => {
  const { copy } = useClipboard();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">AI Suggested Fix</h3>
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
            Recommended
          </span>
        </div>
        <button
          onClick={() => copy(fixedCode, 'Fixed code copied to clipboard!')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy Fixed Code
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-red-900/20 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">Original Code</span>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 text-xs overflow-auto max-h-64">
            <code>{originalCode}</code>
          </pre>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-green-900/20 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Improved Code</span>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 text-xs overflow-auto max-h-64">
            <code>{fixedCode}</code>
          </pre>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Changes Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <span className="font-mono">-</span>
            <span>Removed: `range(len(numbers) + 1)` (index out of range)</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <span className="font-mono">+</span>
            <span>Added: Empty list check with `if not numbers: return 0`</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <span className="font-mono">+</span>
            <span>Improved: Direct iteration `for number in numbers`</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeComparison;
