import React from 'react';
import { cn } from '@/lib/utils';

export function H5({
  className,
  children,
  ...props
}: React.ComponentProps<'h5'>) {
  return (
    <h5
      {...props}
      className={cn(
        'scroll-m-20 text-lg font-semibold tracking-tight',
        className
      )}>
      {children}
    </h5>
  );
}

export default H5;
