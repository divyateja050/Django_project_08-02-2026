import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className }) => {
    return (
        <div className={twMerge(clsx("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className))}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className }) => {
    return <div className={twMerge(clsx("px-6 py-4 border-b border-gray-100", className))}>{children}</div>;
};

export const CardTitle = ({ children, className }) => {
    return <h3 className={twMerge(clsx("text-lg font-semibold text-gray-800", className))}>{children}</h3>;
};

export const CardContent = ({ children, className }) => {
    return <div className={twMerge(clsx("p-6", className))}>{children}</div>;
};
