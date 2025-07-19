import { ServerPosts } from '@/components/server-posts';
import { UserProfile } from '@/components/user-profile';
import { API_BASE_URL, getAuthData } from '@/lib/auth';
import { Header } from '@/components/header';
import { redirect } from 'next/navigation';
import { User } from '@/types';

export default async function Profile({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const profileId = (await params).slug?.[0];

  const authData = await getAuthData();

  // TODO: Use react-query for this too
  const user = profileId
    ? ((await (
        await fetch(`${API_BASE_URL}/users/${profileId}`, {
          headers: { Authorization: authData.token || '' },
        })
      ).json()) as User)
    : authData.user;

  if (!user) return redirect('/signin');

  const postsUrl = `${API_BASE_URL}/users/${user.id}/posts`;

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
