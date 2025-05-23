import React from 'react';
import { cn } from '@/lib/utils';

export function Small({
  className,
  children,
  ...props
}: React.ComponentProps<'small'>) {
  return (
    <small
      {...props}
      className={cn('text-sm font-medium leading-none', className)}>
      {children}
    </small>
  );
}

export default Small;
