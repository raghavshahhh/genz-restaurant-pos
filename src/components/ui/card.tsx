import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export const Card = ({ className = '', children }: CardProps) => {
  const baseClasses = 'rounded-2xl bg-white shadow-sm';

  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';