import React from 'react';
import { cn } from '@/lib/utils';

export function H1({
  className,
  children,
  ...props
}: React.ComponentProps<'h1'>) {
  return (
    <h1
      {...props}
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className
      )}>
      {children}
    </h1>
  );
}

export default H1;
