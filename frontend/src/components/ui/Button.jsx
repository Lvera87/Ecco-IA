import React from 'react';
import PropTypes from 'prop-types';

const variants = {
    primary: "bg-primary text-slate-900 border-transparent hover:shadow-lg hover:-translate-y-0.5 shadow-primary/20",
    secondary: "bg-white text-primary border-transparent shadow-md hover:shadow-xl hover:-translate-y-0.5",
    outline: "bg-transparent border-2 border-white/40 text-white hover:border-white hover:bg-white/5",
    ghost: "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent",
    danger: "bg-red-500 text-white border-transparent hover:bg-red-600",
};

const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-4 text-base",
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon: Icon,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 border gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
            {Icon && <Icon size={20} />}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
    icon: PropTypes.elementType,
};

export default Button;
