import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div className={clsx('card', paddingStyles[padding], className)} {...props}>
      {children}
    </div>
  );
}
