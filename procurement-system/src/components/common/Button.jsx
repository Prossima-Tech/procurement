/* eslint-disable react/prop-types */

const Button = ({ children, onClick, variant = 'default', size = 'md', className = '' }) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

    const variantClasses = {
        default: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-700',
        destructive: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        md: 'p-3 text-base',
        lg: 'px-6 py-3 text-lg',
        icon: 'p-2',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button className={classes} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;