'use client';

import React from 'react';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { PostCard, PostCardSkeleton } from '@/components/post-card';
import { useAuthData } from '@/contexts/auth-context';
import { QueryError } from '@/components/query-error';
import { InView } from 'react-intersection-observer';
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
    authData: { user, authFetch },
  } = useAuthData();

  const {
    data,
    refetch,
    isPending,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isLoadingError,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery<
    Post[],
    Error,
    InfiniteData<Post[], number>,
    readonly unknown[],
    number
  >({
    queryKey: ['posts', postsUrl, authFetch],
    queryFn: async ({ pageParam }) => {
      const url = !(postsUrl instanceof URL) ? new URL(postsUrl) : postsUrl;
      if (pageParam) url.searchParams.set('cursor', pageParam.toString());
      const res = await authFetch(url);
      if (res.ok) return res.json();
      throw res;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.length) return lastPage.at(-1)?.order;
    },
  });

  const fetchNextIfYouCan = () => hasNextPage && !isFetching && fetchNextPage();

  const isFetchDisabled = !hasNextPage || isFetching || isFetchingNextPage;

  return (
    <div
      {...containerProps}
      className={cn('max-w-9xl mx-auto my-8 space-y-8', className)}>
      <H2 className='text-center'>Posts</H2>
      <div className='flex flex-wrap justify-center grow gap-8 px-4 *:sm:max-w-xl *:lg:max-w-md'>
        {isPending ? (
          Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
        ) : isLoadingError || !Array.isArray(data.pages[0]) ? (
          <QueryError
            onRefetch={refetch}
            message='Sorry, we could not load any posts'
          />
        ) : !data.pages[0]?.length ? (
          <P className='text-center'>There are no posts</P>
        ) : (
          data.pages.map((page, i) => (
            <React.Fragment key={data.pageParams[i]}>
              {page.map((post) => (
                <PostCard
                  isMutable={!!user && user.id === post.authorId}
                  key={post.id}
                  post={post}
                />
              ))}
            </React.Fragment>
          ))
        )}
      </div>
      {isFetchingNextPage ? (
        <Loader className='animate-spin mx-auto' />
      ) : isFetchNextPageError ? (
        <QueryError
          onRefetch={fetchNextIfYouCan}
          message='Sorry, we could not load more posts'
        />
      ) : (
        hasNextPage && (
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
        )
      )}
    </div>
  );
}

export default Posts;
