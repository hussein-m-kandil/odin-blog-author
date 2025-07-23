import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { PostPage } from '@/components/post-page';
import { getAuthData } from '@/lib/auth';

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = await params;

  const { backendUrl, token } = await getAuthData();

  const url = `${backendUrl}/posts/${postId}`;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['post', postId, url, token],
    queryFn: async () => {
      // TODO: Use (authedFetch -> authFetch)
      const res = await fetch(url, {
        headers: { Authorization: token || '' },
      });
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostPage postUrl={url} postId={postId} />
    </HydrationBoundary>
  );
}
