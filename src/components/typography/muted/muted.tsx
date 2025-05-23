import React from 'react';
import { cn } from '@/lib/utils';

export function Muted({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p {...props} className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
}

export default Muted;
