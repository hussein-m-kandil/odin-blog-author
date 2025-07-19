import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { API_BASE_URL, getAuthData, URL_HEADER_KEY } from '@/lib/auth';
import { H1 } from '@/components/typography/';
import { Header } from '@/components/header';
import { Posts } from '@/components/posts';
import { headers } from 'next/headers';

export default async function Home() {
  const { token } = await getAuthData();

  const headerStore = await headers();

  const currentUrl =
    headerStore.get(URL_HEADER_KEY) || headerStore.get('referer');
  const postsUrl = `${API_BASE_URL}/posts${
    currentUrl ? new URL(currentUrl).search : ''
  }`;

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
    <>
      <Header>
        <H1>{process.env.NEXT_PUBLIC_APP_NAME || 'Home Page'}</H1>
      </Header>
      <main>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Posts postsUrl={postsUrl} />
        </HydrationBoundary>
      </main>
    </>
  );
}
