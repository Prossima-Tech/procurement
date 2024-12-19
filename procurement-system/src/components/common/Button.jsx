/* eslint-disable react/prop-types */

const Button = ({ children, onClick, variant = 'default', size = 'sm', className = '' }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded focus:ring-1 transition-colors duration-150';

    const variantClasses = {
        default: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700',
        destructive: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
    };

    const sizeClasses = {
        xs: 'px-1.5 py-1 text-xs',
        sm: 'px-2 py-1.5 text-sm',
        md: 'px-3 py-2 text-sm',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;