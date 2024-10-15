import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({ children, onClick, variant = 'primary', disabled = false, size = 'medium', fullWidth = false }) => {
  const { isDarkMode } = useTheme();
  
  const baseClasses = 'font-medium rounded focus:outline-none transition-colors duration-200';
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };
  const variantClasses = {
    primary: isDarkMode 
      ? 'bg-blue-600 text-white hover:bg-blue-700' 
      : 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: isDarkMode
      ? 'bg-gray-700 text-white hover:bg-gray-600'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: isDarkMode
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;