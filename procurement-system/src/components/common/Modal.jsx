/* eslint-disable react/prop-types */

import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Modal = ({ isOpen, onClose, title, children }) => {
    const { isDarkMode } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className={`relative w-full max-w-6xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-xl flex flex-col`}>
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                        <X size={28} />
                    </button>
                </div>
                <div className="p-8 flex-grow overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;