import React from 'react';
import { cn } from '@/lib/utils';

export function H6({
  className,
  children,
  ...props
}: React.ComponentProps<'h6'>) {
  return (
    <h6
      {...props}
      className={cn(
        'scroll-m-20 text-[1rem] font-semibold tracking-tight',
        className
      )}>
      {children}
    </h6>
  );
}

export default H6;
