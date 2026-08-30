import React, { useState, useEffect } from 'react';
import { Check, Loader2, Clock } from 'lucide-react';

interface AnalysisStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

const LoadingAnalysis: React.FC = () => {
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 1, label: 'Reading source code', status: 'completed' },
    { id: 2, label: 'Checking syntax', status: 'completed' },
    { id: 3, label: 'Detecting bugs', status: 'active' },
    { id: 4, label: 'Checking security', status: 'pending' },
    { id: 5, label: 'Analyzing complexity', status: 'pending' },
    { id: 6, label: 'Generating fixes', status: 'pending' },
  ]);

  useEffect(() => {
    let currentStep = 2;
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        const newSteps = steps.map((step, index) => {
          if (index === currentStep) {
            return { ...step, status: 'completed' as const };
          } else if (index === currentStep + 1) {
            return { ...step, status: 'active' as const };
          }
          return step;
        });
        setSteps(newSteps);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Analyzing your code...
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Our AI is reviewing your code for bugs, security issues, and improvements.
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center gap-3"
          >
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${
                step.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : step.status === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-600'
              } transition-all duration-300`}
            >
              {step.status === 'completed' ? (
                <Check className="w-3 h-3" />
              ) : step.status === 'active' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
            </div>
            <span
              className={`text-sm ${
                step.status === 'completed'
                  ? 'text-green-600 dark:text-green-400 font-medium'
                  : step.status === 'active'
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-500 dark:text-gray-600'
              } transition-colors duration-300`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingAnalysis;
