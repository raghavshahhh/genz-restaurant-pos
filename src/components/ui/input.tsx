import * as React from 'react';
import { ReactElement, ForwardRefExoticComponent, RefAttributes } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outline';
}

export const Input: ForwardRefExoticComponent<
  InputProps & RefAttributes<HTMLInputElement>
> = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const baseClasses = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const variantClasses = {
    default: '',
    outline: 'border-gray-300 hover:border-orange-400',
  };

  return (
    <input
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';