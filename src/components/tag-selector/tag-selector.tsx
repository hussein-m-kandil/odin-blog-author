import React from 'react';
import { Querybox, QueryboxProps } from '@/components/querybox';
import { cn, MAX_TAGS_NUM, validateTag } from '@/lib/utils';
import { useAuthData } from '@/contexts/auth-context';
import { Tag } from '@/types';

export type TagSelectorProps = Partial<Pick<QueryboxProps, 'triggerContent'>> &
  Pick<QueryboxProps, 'includeSearchValueInResult' | 'triggerProps'> & {
    onSelect: (tag: string, searchResult?: string[]) => void;
    onError: (message: string) => void;
    tags: string[];
  };

export function TagSelector({
  triggerProps = {},
  tags,
  onError,
  onSelect,
  triggerContent,
  ...queryboxProps
}: TagSelectorProps) {
  const {
    authData: { authAxios },
  } = useAuthData();

  const normalizedTags = tags.map((t) => t.toLowerCase());

  const searchTags = async (searchValue: string) => {
    if (!searchValue) return [];
    const url = `/posts/tags?tags=${searchValue}`;
    const { data } = await authAxios.get<Tag[]>(url);
    const fetchedTags = data.map((tag) => tag.name);
    return fetchedTags.filter((t) => !normalizedTags.includes(t.toLowerCase()));
  };

  const selectTag = (selectedTag: string, searchResult?: string[]) => {
    if (normalizedTags.length < MAX_TAGS_NUM) {
      onSelect(selectedTag, searchResult);
    } else {
      onError('You have reached the maximum number of tags');
    }
  };

  triggerProps.className = cn('text-sm', triggerProps.className);
  triggerProps.size = triggerProps.size || 'sm';

  return (
    <Querybox
      {...queryboxProps}
      label='Tag Selector'
      onSelect={selectTag}
      onSearch={searchTags}
      onValidate={validateTag}
      blacklist={normalizedTags}
      triggerProps={triggerProps}
      queryPlaceholder='Search in tags...'
      triggerContent={triggerContent || 'Select Tags'}
    />
  );
}

export default TagSelector;
