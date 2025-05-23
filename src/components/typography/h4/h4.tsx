import React from 'react';
import { cn } from '@/lib/utils';

export function H4({
  className,
  children,
  ...props
}: React.ComponentProps<'h4'>) {
  return (
    <h4
      {...props}
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className
      )}>
      {children}
    </h4>
  );
}

export default H4;
