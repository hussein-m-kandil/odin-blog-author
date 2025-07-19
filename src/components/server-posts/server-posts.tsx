import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { Posts } from '@/components/posts';
import { AuthData } from '@/types';

export async function ServerPosts({
  authData: { token },
  postsUrl,
}: {
  postsUrl: string | URL;
  authData: AuthData;
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['posts', postsUrl, token],
    queryFn: async () => {
      const res = await fetch(postsUrl, {
        headers: { Authorization: token || '' },
      });
      return res.json();
    },
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts postsUrl={postsUrl} />
    </HydrationBoundary>
  );
}

export default ServerPosts;
