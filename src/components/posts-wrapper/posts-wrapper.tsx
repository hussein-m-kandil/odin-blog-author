import React from 'react';
import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { PostsWrapperSkeleton } from './posts-wrapper.skeleton';
import { SearchParams, ServerAuthData } from '@/types';
import { H2 } from '@/components/typography';
import { Posts } from '@/components/posts';

interface Props {
  searchParams: SearchParams | Awaited<SearchParams>;
  authData: ServerAuthData;
}

const createURLSearchParams = async (searchParams: Props['searchParams']) => {
  return new URLSearchParams(
    Object.fromEntries(
      Object.entries(await searchParams).map(([k, v]) => {
        if (Array.isArray(v)) {
          return [k, v.map((str) => [k, str])];
        } else if (!v) {
          return [k, 'true'];
        }
        return [k, v];
      })
    )
  );
};

export async function PostsWrapper({ searchParams, authData }: Props) {
  const { authFetch, backendUrl } = authData;

  const urlSearchParams = await createURLSearchParams(searchParams);

  const postsUrl = `/posts?${urlSearchParams.toString()}`;

  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['posts', postsUrl, backendUrl],
    queryFn: () => authFetch(postsUrl),
    initialPageParam: 0,
  });

  return (
    <React.Suspense fallback={<PostsWrapperSkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className='max-w-9xl mx-auto my-8 space-y-8'>
          <H2 className='text-center'>Posts</H2>
          <Posts postsUrl={postsUrl} />
        </div>
      </HydrationBoundary>
    </React.Suspense>
  );
}

export default PostsWrapper;
