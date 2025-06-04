'use client';

// Error boundaries must be Client Components

import React from 'react';
import logger from '@/lib/logger';
import { ErrorComponent } from 'next/dist/client/components/error-boundary';
import { ErrorMessage } from '@/components/error-message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PageError({
  errorMessage = 'Something went wrong!',
  resetterLabel = 'Try again',
  childrenPlace = 'bottom',
  className,
  children,
  error,
  reset,
  ...props
}: React.ComponentProps<ErrorComponent> &
  React.ComponentProps<'main'> & {
    childrenPlace?: 'top' | 'middle' | 'bottom';
    resetterLabel?: string;
    errorMessage?: string;
  }) {
  React.useEffect(() => {
    logger.error(error.toString(), error);
  }, [error]);

  return (
    <main
      className={cn('max-w-xl mx-auto mt-7 text-center', className)}
      {...props}>
      {childrenPlace === 'top' && children}
      <ErrorMessage className='mb-2 text-lg'>{errorMessage}</ErrorMessage>
      {childrenPlace === 'middle' && children}
      {reset && (
        <Button variant='outline' size='sm' onClick={() => reset()}>
          {resetterLabel}
        </Button>
      )}
      {childrenPlace === 'bottom' && children}
    </main>
  );
}

export default PageError;
