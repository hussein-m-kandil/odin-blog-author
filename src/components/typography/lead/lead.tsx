import React from 'react';
import { cn } from '@/lib/utils';

export function Lead({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p {...props} className={cn('text-xl text-muted-foreground', className)}>
      {children}
    </p>
  );
}

export default Lead;
