'use client';

import {
  format,
  DateArg,
  formatDistance,
  differenceInMilliseconds,
} from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatDate = (date: DateArg<Date>) => {
  return formatDistance(date, new Date(), { addSuffix: true });
};

const FORMAT = 'yyyy-MM-dd HH:mm:ss.SSS';

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
        dateTime={format(createdAt, FORMAT)}
        className='inline-flex items-center'>
        <Clock
          className='inline-block me-1'
          aria-label='Created at'
          size={16}
        />{' '}
        <span>{formatDate(createdAt)}</span>
      </time>
      {updatedAt &&
        differenceInMilliseconds(updatedAt, createdAt) > 59 * 1000 && (
          <time dateTime={format(updatedAt, FORMAT)}>
            &nbsp;(Updated {formatDate(updatedAt)})
          </time>
        )}
    </span>
  );
}

export default FormattedDate;
