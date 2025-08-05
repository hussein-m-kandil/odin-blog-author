'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export function Tag({
  className,
  onRemove,
  name,
  ...props
}: React.ComponentProps<'button'> & {
  name: string;
  onRemove?: (name: string) => void;
}) {
  const tagProps: React.ComponentProps<typeof Button> = {
    ...props,
    type: 'button',
    variant: 'outline',
    className: cn(
      'text-shadow-foreground hover:text-shadow-xs focus-visible:text-shadow-xs',
      'uppercase text-center rounded-3xl font-light',
      className
    ),
  };

  return typeof onRemove === 'function' ? (
    <div className='relative inline-block'>
      <Button {...tagProps}>{name}</Button>
      <Button
        type='button'
        variant='secondary'
        aria-label={`Remove ${name}`}
        onClick={() => onRemove(name)}
        className={cn(
          'text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:ring-0',
          'rounded-full has-[>svg]:px-0 p-0 w-4 h-4 absolute -top-1 -right-1'
        )}>
        <XCircle />
      </Button>
    </div>
  ) : (
    <Button {...tagProps} asChild>
      <Link href={`/?tags=${encodeURIComponent(name)}`}>{name}</Link>
    </Button>
  );
}

export default Tag;
