import React from 'react';
import { Minus, Copy, Trash2, Maximize } from 'lucide-react';

interface EditorToolbarProps {
  language: string;
  lineCount: number;
  charCount: number;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onCopy: () => void;
  onClear: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  language,
  lineCount,
  charCount,
  isMaximized,
  onToggleMaximize,
  onCopy,
  onClear,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-700 border-b border-gray-600 dark:border-gray-600 rounded-t-lg">
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{language}</span>
        <span className="text-xs text-gray-500">{lineCount} lines</span>
        <span className="text-xs text-gray-500">{charCount} chars</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          className="p-1.5 hover:bg-gray-600 text-gray-400 hover:text-white rounded transition-colors"
          aria-label="Copy code"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-gray-600 text-gray-400 hover:text-white rounded transition-colors"
          aria-label="Clear code"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleMaximize}
          className="p-1.5 hover:bg-gray-600 text-gray-400 hover:text-white rounded transition-colors"
          aria-label={isMaximized ? 'Minimize editor' : 'Maximize editor'}
        >
          {isMaximized ? <Minus className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
