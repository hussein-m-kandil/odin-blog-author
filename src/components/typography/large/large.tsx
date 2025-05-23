import React from 'react';
import { cn } from '@/lib/utils';

export function Large({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('text-lg font-semibold', className)}>
      {children}
    </div>
  );
}

export default Large;
