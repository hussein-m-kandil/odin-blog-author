import React from 'react';
import { cn } from '@/lib/utils';

export function H2({
  className,
  children,
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2
      {...props}
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        className
      )}>
      {children}
    </h2>
  );
}

export default H2;
