'use client';

import React from 'react';
import { InputGroup } from '@/components/input-group';
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

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (query) onSearch(query);
    const form = e.target as HTMLFormElement;
    (form.elements.namedItem('submitter') as HTMLButtonElement).focus();
  };

  if (!props['aria-label'] && !props['aria-labelledby']) {
    props['aria-label'] = 'Search form';
  }

  return (
    <form
      {...props}
      onSubmit={handleSearch}
      className={cn('w-full relative', className)}>
      <InputGroup
        name='q'
        value={query}
        onChange={handleChange}
        aria-label={placeholder}
        placeholder={placeholder}
        buttonProps={{
          ['aria-label']: 'Search',
          name: 'submitter',
          disabled: !query,
          type: 'submit',
        }}>
        <SearchIcon />
      </InputGroup>
    </form>
  );
}

export default Search;
