import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import { UserProfile } from '@/components/user-profile';
import { API_BASE_URL, getAuthData } from '@/lib/auth';
import { Header } from '@/components/header';
import { redirect } from 'next/navigation';
import { Posts } from '@/components/posts';
import { User } from '@/types';

export default async function Profile({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const profileId = (await params).slug?.[0];

  const { token, user: signedInUser } = await getAuthData();

  // TODO: Use react-query for this too
  const user = profileId
    ? ((await (
        await fetch(`${API_BASE_URL}/users/${profileId}`, {
          headers: { Authorization: token || '' },
        })
      ).json()) as User)
    : signedInUser;

  if (!user) return redirect('/signin');

  const postsUrl = `${API_BASE_URL}/users/${user.id}/posts`;

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
        <UserProfile user={user} />
      </Header>
      <main>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Posts postsUrl={postsUrl} />
        </HydrationBoundary>
      </main>
    </>
  );
}
