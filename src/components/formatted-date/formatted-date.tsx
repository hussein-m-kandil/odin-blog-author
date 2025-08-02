'use client';

import { DateArg, formatDistance, differenceInMilliseconds } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatDate = (date: DateArg<Date>) => {
  return formatDistance(date, new Date(), { addSuffix: true });
};

export function FormattedDate({
  createdAt,
  updatedAt,
  className,
  ...props
}: React.ComponentProps<'span'> & {
  createdAt: DateArg<Date>;
  updatedAt?: DateArg<Date>;
}) {
  return (
    <span
      {...props}
      className={cn('flex flex-wrap items-center gap-1 text-sm', className)}>
      <time
        suppressHydrationWarning
        className='inline-flex items-center'
        dateTime={new Date(createdAt).toISOString()}>
        <Clock
          className='inline-block me-1'
          aria-label='Created at'
          size={16}
        />{' '}
        <span>{formatDate(createdAt)}</span>
      </time>
      {updatedAt &&
        differenceInMilliseconds(updatedAt, createdAt) > 59 * 1000 && (
          <time
            suppressHydrationWarning
            dateTime={new Date(updatedAt).toISOString()}>
            &nbsp;(Updated {formatDate(updatedAt)})
          </time>
        )}
    </span>
  );
}

export default FormattedDate;
