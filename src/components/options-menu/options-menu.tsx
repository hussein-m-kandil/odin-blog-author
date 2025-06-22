'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OptionsMenu({
  triggerProps,
  menuProps,
  menuItems,
}: {
  menuProps?: React.ComponentProps<typeof DropdownMenuContent>;
  menuItems?: React.ReactNode | React.ReactNode[];
  triggerProps?: React.ComponentProps<'button'>;
}) {
  const items = Array.isArray(menuItems) ? menuItems : [menuItems];

  if (items.length < 1 || items.every((i) => !i)) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        {...triggerProps}
        aria-label={triggerProps?.['aria-label'] || 'Open options menu'}
        className={cn(
          'focus-visible:outline-0 hover:text-foreground focus-visible:text-foreground',
          'w-4 text-muted-foreground',
          triggerProps?.className
        )}>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        {...menuProps}
        aria-label={menuProps?.['aria-label'] || 'Options menu'}
        className={cn('*:w-full *:text-start', menuProps?.className)}>
        {items.map(
          (i, index) =>
            (i || i === 0) && (
              <DropdownMenuItem key={index} asChild={typeof i === 'object'}>
                {i}
              </DropdownMenuItem>
            )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OptionsMenu;
