import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { PostPage } from '@/components/post-page';
import { getServerAuthData } from '@/lib/auth';

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = await params;

  const { authFetch } = await getServerAuthData();

  const url = `/posts/${postId}`;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['post', postId, url],
    queryFn: async () => await authFetch(url),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostPage postUrl={url} postId={postId} />
    </HydrationBoundary>
  );
}
