import React from 'react';
import { Cpu, CheckSquare, Square, AlertCircle } from 'lucide-react';
import type { Provider } from '../../services/api';

interface ProviderSelectorProps {
  providers: Provider[];
  mode: 'single' | 'multiple';
  selectedProvider?: string;
  selectedProviders?: string[];
  onSelectProvider?: (provider: string) => void;
  onToggleProvider?: (provider: string) => void;
  disabled?: boolean;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  mode,
  selectedProvider,
  selectedProviders = [],
  onSelectProvider,
  onToggleProvider,
  disabled = false,
}) => {
  if (mode === 'single') {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          AI Provider
        </label>
        <div className="relative">
          <select
            value={selectedProvider}
            onChange={(e) => onSelectProvider?.(e.target.value)}
            disabled={disabled || providers.length === 0}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {providers.length === 0 ? (
              <option value="">Loading providers...</option>
            ) : (
              providers.map((p) => (
                <option key={p.id} value={p.id} disabled={!p.available}>
                  {p.name} {p.available ? '' : '(Not configured)'}
                </option>
              ))
            )}
          </select>
          <Cpu className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Select AI Providers (Pick 2 or more)
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {selectedProviders.length} selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {providers.map((p) => {
          const isSelected = selectedProviders.includes(p.id);
          const isAvailable = p.available;

          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled || !isAvailable}
              onClick={() => onToggleProvider?.(p.id)}
              className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                !isAvailable
                  ? 'bg-gray-100/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{p.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isAvailable ? 'Available' : 'Not configured'}
                  </p>
                </div>
              </div>

              <div>
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedProviders.length < 2 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Please select at least 2 AI providers to enable cross-model comparison.
        </p>
      )}
    </div>
  );
};

export default ProviderSelector;
