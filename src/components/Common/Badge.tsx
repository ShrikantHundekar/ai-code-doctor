import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success';
  className?: string;
}

const variantClasses = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-600 text-white',
  medium: 'bg-yellow-600 text-white',
  low: 'bg-blue-600 text-white',
  info: 'bg-purple-600 text-white',
  success: 'bg-green-600 text-white',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant, className = '' }) => {
  const variantClass = variantClasses[variant];
  const finalClassName = ['inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium', variantClass, className].filter(Boolean).join(' ');

  return (
    <span className={finalClassName}>{children}</span>
  );
};

export default Badge;
