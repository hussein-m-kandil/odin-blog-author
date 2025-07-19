'use client';

import React from 'react';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { PostCard } from '@/components/post-card';
import { H2, P } from '@/components/typography/';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Post } from '@/types';

export function Posts({
  postsUrl,
  className,
  ...containerProps
}: React.ComponentProps<'div'> & {
  postsUrl: URL | string;
}) {
  const {
    authData: { user, token },
  } = useAuthData();

  const {
    data,
    status,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<
    Post[],
    Error,
    InfiniteData<Post[], number>,
    readonly unknown[],
    number
  >({
    queryKey: ['posts', postsUrl, token],
    queryFn: async ({ pageParam }) => {
      const url = `${postsUrl}${pageParam === 0 ? '' : '?cursor=' + pageParam}`;
      const res = await fetch(url, { headers: { Authorization: token || '' } });
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) return null;
      return lastPageParam + lastPage.length;
    },
  });

  const fetchNextIfYouCan = () => hasNextPage && !isFetching && fetchNextPage();

  const isFetchDisabled = !hasNextPage || isFetching;

  if (status === 'pending') {
    // TODO: Change this into something cool like a skeleton
    return <P className='text-center'>Loading...</P>;
  }

  if (status === 'error') {
    return <ErrorMessage>Sorry, we could not get any posts</ErrorMessage>;
  }

  if (data.pages[0]?.length === 0) {
    return <P className='text-center'>There are no posts</P>;
  }

  return (
    <div
      {...containerProps}
      className={cn('max-w-9xl mx-auto my-8 space-y-8', className)}>
      <H2 className='text-center'>Posts</H2>
      <div className='flex flex-wrap justify-center grow gap-8 px-4 *:sm:max-w-xl *:lg:max-w-md'>
        {data.pages.map((page, i) => (
          <React.Fragment key={data.pageParams[i]}>
            {page.map((post) => (
              <PostCard
                isMutable={!!user && user.id === post.authorId}
                key={post.id}
                post={post}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      {hasNextPage && (
        <div className='text-center'>
          <Button
            type='button'
            variant='link'
            onClick={fetchNextIfYouCan}
            disabled={isFetchDisabled}>
            {isFetchingNextPage ? (
              <Loader className='animate-spin' />
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Posts;
