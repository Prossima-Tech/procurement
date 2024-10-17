/* eslint-disable react/prop-types */
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
    const alertTypes = {
        success: {
            icon: <CheckCircle className="h-5 w-5" />,
            color: 'bg-green-100 text-green-800',
            iconColor: 'text-green-400',
        },
        error: {
            icon: <AlertCircle className="h-5 w-5" />,
            color: 'bg-red-100 text-red-800',
            iconColor: 'text-red-400',
        },
        warning: {
            icon: <AlertCircle className="h-5 w-5" />,
            color: 'bg-yellow-100 text-yellow-800',
            iconColor: 'text-yellow-400',
        },
        info: {
            icon: <Info className="h-5 w-5" />,
            color: 'bg-blue-100 text-blue-800',
            iconColor: 'text-blue-400',
        },
    };

    const { icon, color, iconColor } = alertTypes[type] || alertTypes.info;

    return (
        <div className={`rounded-md p-4 ${color}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className={iconColor}>{icon}</span>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm">{message}</p>
                </div>
                {onClose && (
                    <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${color}`}
                                onClick={onClose}
                            >
                                <span className="sr-only">Dismiss</span>
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alert;