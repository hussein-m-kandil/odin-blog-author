import React from 'react';
import { cn } from '@/lib/utils';

export function Code({
  className,
  children,
  ...props
}: React.ComponentProps<'code'>) {
  return (
    <code
      {...props}
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className
      )}>
      {children}
    </code>
  );
}

export default Code;
