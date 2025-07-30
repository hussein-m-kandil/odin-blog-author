import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { H2 } from '@/components/typography';
import { Posts } from '@/components/posts';
import { ServerAuthData } from '@/types';

export async function ServerPosts({
  authData: { authFetch },
  postsUrl,
}: {
  authData: ServerAuthData;
  postsUrl: string;
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['posts', postsUrl],
    queryFn: async () => await authFetch(postsUrl),
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='max-w-9xl mx-auto my-8 space-y-8'>
        <H2 className='text-center'>Posts</H2>
        <Posts postsUrl={postsUrl} />
      </div>
    </HydrationBoundary>
  );
}

export default ServerPosts;
