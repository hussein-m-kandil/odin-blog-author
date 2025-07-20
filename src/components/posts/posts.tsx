'use client';

import React from 'react';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { PostCard, PostCardSkeleton } from '@/components/post-card';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { InView } from 'react-intersection-observer';
import { H2, P } from '@/components/typography/';
import { Button } from '@/components/ui/button';
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

  const loader = <PostCardSkeleton />;

  if (status === 'pending') return loader;

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
        {isFetchingNextPage && loader}
      </div>
      {!isFetchingNextPage && hasNextPage && (
        <InView
          as='div'
          className='text-center'
          onChange={(inView) => inView && fetchNextIfYouCan()}>
          <Button
            type='button'
            variant='link'
            onClick={fetchNextIfYouCan}
            disabled={isFetchDisabled}>
            Load More
          </Button>
        </InView>
      )}
    </div>
  );
}

export default Posts;
