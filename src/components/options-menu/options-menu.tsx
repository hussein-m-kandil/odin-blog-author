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
  triggerLabel,
  triggerCN,
  menuLabel,
  menuItems,
  menuCN,
}: {
  menuItems?: React.ReactNode | React.ReactNode[];
  triggerLabel?: string;
  triggerCN?: string;
  menuLabel?: string;
  menuCN?: string;
}) {
  const items = Array.isArray(menuItems) ? menuItems : [menuItems];

  if (items.length < 1 || items.every((i) => !i)) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={triggerLabel || 'Open options menu'}
        className={cn(
          'focus-visible:outline-0 hover:text-foreground focus-visible:text-foreground',
          'w-4 text-muted-foreground',
          triggerCN
        )}>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn('*:w-full *:text-start', menuCN)}
        aria-label={menuLabel || 'Options menu'}>
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
