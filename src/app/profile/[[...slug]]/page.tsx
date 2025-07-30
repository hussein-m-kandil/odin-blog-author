import { ServerPosts } from '@/components/server-posts';
import { UserProfile } from '@/components/user-profile';
import { getServerAuthData } from '@/lib/auth';
import { Header } from '@/components/header';
import { redirect } from 'next/navigation';
import { User } from '@/types';

export default async function Profile({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const profileId = (await params).slug?.[0];

  const authData = await getServerAuthData();
  const { authFetch, backendUrl } = authData;

  // TODO: Use react-query for this too
  const user = profileId
    ? await authFetch<User>(`${backendUrl}/users/${profileId}`)
    : authData.user;

  if (!user) return redirect('/signin');

  const postsUrl = `${backendUrl}/posts?author=${user.id}`;

  return (
    <>
      <Header>
        <UserProfile user={user} />
      </Header>
      <main>
        <ServerPosts postsUrl={postsUrl} authData={authData} />
      </main>
    </>
  );
}
