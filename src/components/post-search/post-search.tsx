'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TagSelector } from '@/components/tag-selector';
import { ArrowDownUp, Filter } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Search } from '@/components/search';
import { Tags } from '@/components/tags';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function PostSearch({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const searchParams = new URLSearchParams(useSearchParams());
  const pathname = usePathname();
  const router = useRouter();

  const tags = searchParams.get('tags')?.split(',') || [];
  const reversed = searchParams.get('sort') === 'asc';
  const query = searchParams.get('q') || '';

  const applySearchParams = () => {
    const urlSearch = searchParams.toString();
    router.replace(`${pathname}?${urlSearch}`, { scroll: false });
  };

  const handlePressReverse = (pressed: boolean) => {
    searchParams.set('sort', pressed ? 'asc' : 'desc');
    applySearchParams();
  };

  const handleSearch = (qParam: string) => {
    if (qParam && qParam !== searchParams.get('q')) {
      searchParams.set('q', qParam);
      applySearchParams();
    }
  };

  const handleSelectTag = (tag: string, searchResult?: string[]) => {
    if (tag && searchResult) {
      const tagInSearchResult = searchResult.find((t) => t === tag);
      if (tagInSearchResult) {
        const tagsParam = [...tags, tag].join(',');
        if (searchParams.get('tags') !== tagsParam) {
          searchParams.set('tags', tagsParam);
          applySearchParams();
        }
      }
    }
  };

  const removeTag = (tag: string) => {
    const tagsParam = tags.filter((t) => t !== tag).join(',');
    if (!tagsParam) {
      searchParams.delete('tags');
      applySearchParams();
    } else if (tagsParam !== searchParams.get('tags')) {
      searchParams.set('tags', tagsParam);
      applySearchParams();
    }
  };

  const handleTagSelectionError = (message: string) => toast.error(message);

  return (
    <div {...props} className={cn('max-w-lg mx-auto space-y-3!', className)}>
      <Search
        key={query}
        initQuery={query}
        onSearch={handleSearch}
        placeholder='Search in posts...'
      />
      <div className='my-4 flex justify-center gap-4'>
        <TagSelector
          tags={tags}
          onSelect={handleSelectTag}
          onError={handleTagSelectionError}
          triggerContent={
            <>
              <Filter aria-label='Filter icon' /> Tags
            </>
          }
        />
        <Toggle
          size='sm'
          variant='outline'
          pressed={reversed}
          aria-label='Reverse'
          onPressedChange={handlePressReverse}>
          <ArrowDownUp />
        </Toggle>
      </div>
      <Tags tags={tags} onRemove={removeTag} />
    </div>
  );
}

export default PostSearch;
