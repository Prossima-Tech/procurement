import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Modal = ({ isOpen, onClose, title, children }) => {
    const { isDarkMode } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div 
                    className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${
                        isDarkMode 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-white text-gray-900'
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{title}</h2>
                        <button
                            onClick={onClose}
                            className={`p-1 rounded-full hover:bg-opacity-80 ${
                                isDarkMode 
                                    ? 'hover:bg-gray-700' 
                                    : 'hover:bg-gray-200'
                            }`}
                        >
                            <svg 
                                className="w-6 h-6" 
                                fill="none" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className={`${
                        isDarkMode 
                            ? 'text-gray-300' 
                            : 'text-gray-600'
                    }`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;