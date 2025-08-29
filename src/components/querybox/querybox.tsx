'use client';

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
import { QueryError } from '@/components/query-error';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

const createStrEqChecker = (a: string) => (b: string) => {
  return a.toLowerCase() === b.toLowerCase();
};

export interface QueryboxProps {
  triggerProps?: Omit<React.ComponentProps<typeof Button>, 'aria-expanded'>;
  onSearch: (searchValue: string) => string[] | Promise<string[]>;
  onSelect: (v: string, searchResult?: string[]) => void;
  onValidate: (searchValue: string) => boolean;
  includeSearchValueInResult?: boolean;
  triggerContent: React.ReactNode;
  queryPlaceholder?: string;
  blacklist?: string[];
  label?: string;
}

export function Querybox({
  includeSearchValueInResult = false,
  queryPlaceholder = 'Search...',
  triggerProps = {},
  blacklist = [],
  triggerContent,
  label,
  onSelect,
  onSearch,
  onValidate,
}: QueryboxProps) {
  const [searchValue, setSearchValue] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  const queryClient = useQueryClient();
  const queryKey = ['querybox', id, searchValue];
  const { data, refetch, isError, isFetching } = useQuery<string[]>({
    queryKey,
    retry: false,
    enabled: !!searchValue,
    queryFn: () => onSearch(searchValue),
    select: (queryResult) => {
      return queryResult.filter(
        (value) => !blacklist.some(createStrEqChecker(value))
      );
    },
  });

  const handleSearch = async (inputValue: string) => {
    if (onValidate(inputValue)) {
      queryClient.cancelQueries({ queryKey, exact: true });
      setSearchValue(inputValue);
    }
  };

  const handleSelectItem = (selectedValue: string) => {
    onSelect(selectedValue, data);
    setSearchValue('');
    setOpen(false);
  };

  triggerProps.variant = triggerProps.variant || 'outline';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button {...triggerProps} aria-expanded={open}>
          {triggerContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command
          filter={() => 1}
          label={
            label ||
            (typeof triggerContent === 'string' && triggerContent) ||
            'Search'
          }>
          <CommandInput
            placeholder={queryPlaceholder}
            onValueChange={handleSearch}
            value={searchValue}
            name='autocomplete'
            autoComplete='off'
            className='h-9'
          />
          <CommandList
            className='py-1'
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}>
            {isError ? (
              <QueryError onRefetch={refetch} className='space-y-1 pb-2'>
                Could not search
              </QueryError>
            ) : isFetching ? (
              <div aria-label='Loading...' className='flex justify-center py-1'>
                <Loader size={16} className='animate-spin' />
              </div>
            ) : (
              Array.isArray(data) && (
                <CommandGroup>
                  {includeSearchValueInResult &&
                    !data.some(createStrEqChecker(searchValue)) && (
                      <CommandItem
                        value={searchValue}
                        className='font-bold'
                        onSelect={handleSelectItem}>
                        {searchValue}
                      </CommandItem>
                    )}
                  {data.map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={handleSelectItem}>
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Querybox;
