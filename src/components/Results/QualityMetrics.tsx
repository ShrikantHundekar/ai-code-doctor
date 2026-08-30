import React from 'react';
import type { QualityMetrics as QualityMetricsType } from '../../types';

interface QualityMetricsProps {
  metrics: QualityMetricsType;
}

const MetricBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <span className="text-sm font-bold text-gray-800 dark:text-white">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const QualityMetrics: React.FC<QualityMetricsProps> = ({ metrics }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quality Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricBar label="Readability" value={metrics.readability} color="bg-blue-600" />
        <MetricBar label="Maintainability" value={metrics.maintainability} color="bg-green-600" />
        <MetricBar label="Performance" value={metrics.performance} color="bg-purple-600" />
        <MetricBar label="Security" value={metrics.security} color="bg-yellow-600" />
      </div>
    </div>
  );
};

export default QualityMetrics;
