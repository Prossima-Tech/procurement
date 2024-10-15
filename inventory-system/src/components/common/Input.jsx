import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Input = ({ label, name, type = 'text', value, onChange, error, required = false }) => {
  const { isDarkMode } = useTheme();

  return (
    <div>
      <label htmlFor={name} className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          mt-1 block w-full px-3 py-2 rounded-md text-sm shadow-sm placeholder-slate-400
          ${isDarkMode 
            ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500' 
            : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
          ${error ? 'border-red-500' : ''}
        `}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;