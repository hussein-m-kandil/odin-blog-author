import React from 'react';
import { cn } from '@/lib/utils';

export function P({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      {...props}
      className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}>
      {children}
    </p>
  );
}

export default P;
