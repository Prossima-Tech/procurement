/* eslint-disable react/prop-types */

import { AlertTriangle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const DeleteConfirmationDialog = ({
    title = 'Delete Confirmation',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    itemType = 'item',
    itemName = '',
    closeToast,
    onDelete,
    variant = 'danger', // 'danger' | 'warning'
}) => {
    const { isDarkMode } = useTheme();

    const Icon = variant === 'danger' ? AlertCircle : AlertTriangle;
    const colorClasses = {
        icon: variant === 'danger' ? 'text-red-500' : 'text-yellow-500',
        deleteButton: variant === 'danger'
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
            : 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
    };

    const buttonClass = `
        px-4 py-2 rounded-md text-sm font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
    `;

    const cancelButtonClass = `
        ${buttonClass}
        ${isDarkMode
            ? 'bg-gray-600 hover:bg-gray-500 text-gray-100 focus:ring-gray-500'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400'}
    `;

    const deleteButtonClass = `
        ${buttonClass}
        ${colorClasses.deleteButton}
        text-white
    `;

    return (
        <div className="flex flex-col w-full">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
                <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>

            {/* Content */}
            <div className="space-y-4">
                <p className="text-sm">
                    {message}
                </p>
                {itemName && (
                    <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                        <p className="text-sm font-medium">
                            {itemType}: <span className="font-semibold">{itemName}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6">
                <button
                    onClick={closeToast}
                    className={cancelButtonClass}
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        onDelete();
                        closeToast();
                    }}
                    className={deleteButtonClass}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default DeleteConfirmationDialog;