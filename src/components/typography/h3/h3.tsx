import React from 'react';
import { cn } from '@/lib/utils';

export function H3({
  className,
  children,
  ...props
}: React.ComponentProps<'h3'>) {
  return (
    <h3
      {...props}
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        className
      )}>
      {children}
    </h3>
  );
}

export default H3;
