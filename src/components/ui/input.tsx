import * as React from 'react';
import { ReactElement, ForwardRefExoticComponent, RefAttributes } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outline';
}

export const Input: ForwardRefExoticComponent<
  InputProps & RefAttributes<HTMLInputElement>
> = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const variantClasses = {
    default: '',
    outline: 'border-input hover:border-accent',
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