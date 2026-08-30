import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  ghost: 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  link: 'text-blue-600 hover:underline',
};

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', onClick, disabled = false, className = '' }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const finalClassName = [baseClasses, variantClass, sizeClass, disabledClass, className].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={finalClassName}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
