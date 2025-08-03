'use client';

import {
  format,
  differenceInMilliseconds,
  formatDistanceToNowStrict,
} from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type DateT = Date | string | number;

const LONG_FORMAT = 'yyyy-MM-dd HH:mm';

const formatDateToNow = (date: DateT) => {
  const fullUnitDistance = formatDistanceToNowStrict(date);
  const [amount, unit] = fullUnitDistance.split(' ');
  return `${amount}${unit.slice(0, /month/i.test(unit) ? 2 : 1)}`;
};

export function FormattedDate({
  createdAt,
  updatedAt,
  className,
  ...props
}: React.ComponentProps<'span'> & {
  createdAt: DateT;
  updatedAt?: DateT;
}) {
  const formattedCreatedAt = format(createdAt, LONG_FORMAT);

  let updateTimeElement;
  if (updatedAt && differenceInMilliseconds(updatedAt, createdAt) > 59 * 1000) {
    const formattedUpdatedAt = format(updatedAt, LONG_FORMAT);
    updateTimeElement = (
      <>
        <span>.</span>
        <time
          suppressHydrationWarning
          title={formattedUpdatedAt}
          dateTime={formattedUpdatedAt}>
          updated {formatDateToNow(updatedAt)}
        </time>
      </>
    );
  }

  return (
    <span
      {...props}
      className={cn(
        'flex flex-wrap items-center gap-1 text-sm leading-0',
        className
      )}>
      <Clock className='inline-block' aria-label='Clock icon' size={14} />
      <time
        suppressHydrationWarning
        title={formattedCreatedAt}
        dateTime={formattedCreatedAt}>
        {formatDateToNow(createdAt)}
      </time>
      {updateTimeElement}
    </span>
  );
}

export default FormattedDate;
