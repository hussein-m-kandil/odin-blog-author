import React from 'react';
import { cn } from '@/lib/utils';

export function Blockquote({
  className,
  children,
  ...props
}: React.ComponentProps<'blockquote'>) {
  return (
    <blockquote
      {...props}
      className={cn('mt-6 border-l-2 pl-6 italic', className)}>
      {children}
    </blockquote>
  );
}

export default Blockquote;
