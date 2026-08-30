import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import type { SecurityIssue } from '../../types';

interface SecuritySectionProps {
  securityIssues?: SecurityIssue[];
  issues?: SecurityIssue[];
}

const severityColors: Record<string, string> = {
  critical: 'border-red-600 bg-red-50 dark:bg-red-900/20',
  high: 'border-orange-600 bg-orange-50 dark:bg-orange-900/20',
  medium: 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'border-blue-600 bg-blue-50 dark:bg-blue-900/20',
  info: 'border-gray-600 bg-gray-50 dark:bg-gray-900/20',
};

const SecuritySection: React.FC<SecuritySectionProps> = ({ securityIssues, issues }) => {
  const allIssues = securityIssues || issues || [];
  const hasCriticalIssues = allIssues.some(
    (i) => i.severity?.toLowerCase() === 'critical' || i.severity?.toLowerCase() === 'high'
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className={`w-5 h-5 ${hasCriticalIssues ? 'text-red-500' : 'text-green-500'}`} />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Security Analysis</h3>
      </div>

      {allIssues.length === 0 ? (
        <div className="text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            No critical security vulnerabilities detected
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allIssues.map((issue, idx) => {
            const sev = issue.severity?.toLowerCase() || 'info';
            const colorClass = severityColors[sev] || severityColors.info;
            return (
              <div
                key={issue.id || idx}
                className={`border-l-4 ${colorClass} rounded-lg p-4`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      sev === 'critical'
                        ? 'text-red-600'
                        : sev === 'high'
                        ? 'text-orange-600'
                        : sev === 'medium'
                        ? 'text-yellow-600'
                        : sev === 'low'
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                      {issue.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {issue.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SecuritySection;
