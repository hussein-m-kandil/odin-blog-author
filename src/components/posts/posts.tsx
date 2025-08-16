'use client';

import React from 'react';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { PostCard } from '@/components/post-card';
import { useAuthData } from '@/contexts/auth-context';
import { QueryError } from '@/components/query-error';
import { InView } from 'react-intersection-observer';
import { PostsSkeleton } from './posts.skeleton';
import { Button } from '@/components/ui/button';
import { P } from '@/components/typography/';
import { Loader } from 'lucide-react';
import { Post } from '@/types';

export function Posts({ postsUrl }: { postsUrl: string }) {
  const {
    authData: { user, authAxios, backendUrl },
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
    queryKey: ['posts', postsUrl, backendUrl],
    queryFn: async ({ pageParam }) => {
      const url = new URL(`${backendUrl}${postsUrl}`);
      if (pageParam) url.searchParams.set('cursor', pageParam.toString());
      return (await authAxios.get(url.href, { baseURL: '' })).data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.length) {
        const lastPost = lastPage[lastPage.length - 1];
        return lastPost ? lastPost.order : null;
      }
    },
  });

  const fetchNextIfYouCan = () => hasNextPage && !isFetching && fetchNextPage();

  const isFetchDisabled = !hasNextPage || isFetching || isFetchingNextPage;

  if (isPending) {
    return <PostsSkeleton />;
  }

  return (
    <>
      <div className='flex flex-wrap justify-center grow gap-8 px-4 *:sm:max-w-xl *:lg:max-w-md'>
        {isLoadingError || !Array.isArray(data.pages[0]) ? (
          <QueryError onRefetch={refetch}>
            Sorry, we could not load any posts
          </QueryError>
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
        <QueryError onRefetch={fetchNextIfYouCan}>
          Sorry, we could not load more posts
        </QueryError>
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
    </>
  );
}

export default Posts;
