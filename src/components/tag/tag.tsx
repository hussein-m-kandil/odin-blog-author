'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export function Tag({
  closeBtnCN,
  className,
  onRemove,
  name,
  ...props
}: React.ComponentProps<'button'> & {
  onRemove?: (name: string) => void;
  closeBtnCN?: string;
  name: string;
}) {
  const removable = typeof onRemove === 'function';

  const tagProps: React.ComponentProps<typeof Button> = {
    ...props,
    title: name,
    type: 'button',
    variant: 'outline',
    className: cn(
      'size-fit max-w-[150px] items-center rounded-3xl py-1 px-2',
      'lowercase text-center text-xs',
      !removable &&
        'text-shadow-foreground hover:text-shadow-xs focus-visible:text-shadow-xs',
      className
    ),
  };

  const tag = <span className='min-w-0 max-w-full truncate'>{name}</span>;

  return (
    <div className='relative inline-flex'>
      {removable ? (
        <>
          <Button {...tagProps} asChild>
            <span>{tag}</span>
          </Button>
          <Button
            type='button'
            variant='secondary'
            aria-label={`Remove ${name}`}
            onClick={() => onRemove(name)}
            className={cn(
              'text-muted-foreground hover:text-foreground focus-visible:text-foreground',
              'rounded-full focus-visible:ring-0 p-0!',
              'size-4 absolute -top-1.5 -right-1.5',
              closeBtnCN
            )}>
            <XCircle />
          </Button>
        </>
      ) : (
        <Button {...tagProps} asChild>
          <Link href={`/?tags=${encodeURIComponent(name)}`}>{tag}</Link>
        </Button>
      )}
    </div>
  );
}

export default Tag;
