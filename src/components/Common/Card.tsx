import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'transparent';
  className?: string;
}

const variantClasses = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  highlight: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
  transparent: 'bg-transparent border-transparent',
};

export const Card: React.FC<CardProps> = ({ children, variant = 'default', className = '' }) => {
  const variantClass = variantClasses[variant];
  const finalClassName = ['p-4 rounded-lg', variantClass, className].filter(Boolean).join(' ');

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
};

export default Card;
