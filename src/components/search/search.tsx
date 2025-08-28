'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Search({
  placeholder = 'Search...',
  initQuery = '',
  onSearch,
  onChange,
  className,
  ...props
}: Omit<React.ComponentProps<'form'>, 'onSubmit' | 'onChange'> & {
  onChange?: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  initQuery?: string;
}) {
  const [query, setQuery] = React.useState(initQuery);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setQuery(e.target.value);
    onChange?.(e.target.value);
  };

  const handleSearch: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (query) onSearch(query);
  };

  if (!props['aria-label'] && !props['aria-labelledby']) {
    props['aria-label'] = 'Search form';
  }

  return (
    <form
      {...props}
      onSubmit={handleSearch}
      className={cn('w-full relative', className)}>
      <Input
        name='q'
        type='text'
        value={query}
        className='pe-12'
        autoComplete='off'
        onChange={handleChange}
        aria-label={placeholder}
        placeholder={placeholder}
      />
      <div className='absolute top-0 right-0 text-gray-500'>
        <Button
          size='icon'
          type='submit'
          variant='outline'
          disabled={!query}
          aria-label='Search'
          className={cn(
            'hover:bg-transparent focus-visible:ring-0 focus-visible:text-foreground',
            'border-0 rounded-l-none shadow-none bg-transparent'
          )}>
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
}

export default Search;
