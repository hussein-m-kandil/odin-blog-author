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
}: React.ComponentProps<'time'> & {
  createdAt: DateArg<Date>;
  updatedAt?: DateArg<Date>;
}) {
  return (
    <time
      {...props}
      dateTime={format(createdAt, FORMAT)}
      className={cn('flex items-center gap-1 font-normal', className)}>
      <Clock size={16} aria-label='Creation date' />
      <span>{formatDate(createdAt)}</span>
      {updatedAt &&
        differenceInMilliseconds(updatedAt, createdAt) > 59 * 1000 && (
          <time dateTime={format(updatedAt, FORMAT)}>
            &nbsp;(Updated {formatDate(updatedAt)})
          </time>
        )}
    </time>
  );
}

export default FormattedDate;
