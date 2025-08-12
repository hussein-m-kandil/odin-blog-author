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

const UPDATE_PERIOD = 2 * 60 * 60 * 1000;

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
  const humanizedCreatedAt = formatDateToNow(createdAt);

  let updateTimeElement;
  if (
    updatedAt &&
    differenceInMilliseconds(updatedAt, createdAt) > UPDATE_PERIOD
  ) {
    const formattedUpdatedAt = format(updatedAt, LONG_FORMAT);
    const humanizedUpdatedAt = formatDateToNow(updatedAt);
    if (humanizedUpdatedAt !== humanizedCreatedAt) {
      updateTimeElement = (
        <>
          <span>.</span>
          <time
            suppressHydrationWarning
            title={formattedUpdatedAt}
            dateTime={formattedUpdatedAt}>
            updated {humanizedUpdatedAt}
          </time>
        </>
      );
    }
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
        {humanizedCreatedAt}
      </time>
      {updateTimeElement}
    </span>
  );
}

export default FormattedDate;
