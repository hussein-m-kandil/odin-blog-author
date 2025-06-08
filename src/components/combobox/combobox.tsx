'use client';

// https://ui.shadcn.com/docs/components/combobox

import * as React from 'react';
import {
  Command,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandInput,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import logger from '@/lib/logger';

export function Combobox({
  triggerContent,
  searchValidator,
  onSearch,
  onSelect,
}: {
  onSearch: (v: string) => string[] | Promise<string[]>;
  searchValidator?: (v: string) => boolean;
  triggerContent: React.ReactNode;
  onSelect: (v: string) => void;
}) {
  const [searchResult, setSearchResult] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const isFreshSearchRef = React.useRef(false);

  React.useEffect(() => {
    return () => {
      isFreshSearchRef.current = false;
    };
  }, []);

  const handleSearch = async (currentValue: string) => {
    try {
      if (searchValidator && !searchValidator(currentValue)) return;
      setLoading(true);
      setValue(currentValue);
      isFreshSearchRef.current = true;
      const fetchedResult = await onSearch(currentValue);
      if (isFreshSearchRef.current) {
        const updatedResult = Array.from(new Set(fetchedResult));
        setSearchResult(updatedResult);
      }
    } catch (error) {
      logger.error('Autocomplete error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (selectedValue: string) => {
    isFreshSearchRef.current = false;
    onSelect(selectedValue);
    setSearchResult([]);
    setOpen(false);
    setValue('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' role='combobox' aria-expanded={open}>
          {triggerContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0 max-h-28'>
        <Command>
          <CommandInput
            value={value}
            autoComplete='off'
            name='autocomplete'
            aria-label='Search'
            onValueChange={handleSearch}
            placeholder='Search...'
            className='h-9'
          />
          <CommandList>
            <CommandGroup
              className='max-h-28 overflow-auto'
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}>
              {loading && (
                <div
                  aria-label='Loading...'
                  className='flex justify-center py-1'>
                  <Loader size={16} className='animate-spin' />
                </div>
              )}
              {!searchResult.find(
                (x) => x.toUpperCase() === value.toUpperCase()
              ) && (
                <CommandItem
                  value={value}
                  className='font-bold'
                  onSelect={handleSelectItem}>
                  {value}
                </CommandItem>
              )}
              {searchResult.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={handleSelectItem}>
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Combobox;
