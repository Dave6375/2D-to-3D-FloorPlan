import type { ButtonHTMLAttributes, ReactNode } from 'react';
import React from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = `${baseClass}--${variant}`;
    const sizeClass = `${baseClass}--${size}`;
    const fullWidthClass = fullWidth ? `${baseClass}--full` : '';

    const combinedClasses = [
        baseClass,
        variantClass,
        sizeClass,
        fullWidthClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
};

export default Button;
