import { PostsWrapper } from '@/components/posts-wrapper';
import { UserProfile } from '@/components/user-profile';
import { getServerAuthData } from '@/lib/auth';
import { Header } from '@/components/header';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { User } from '@/types';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ slug?: string[] }>;
};

const getProfileAndAuthDataOrRedirect = async (profileId?: string) => {
  const authData = await getServerAuthData();
  const { authFetch } = authData;

  const profile = profileId
    ? await authFetch<User>(`/users/${profileId}`)
    : authData.user;

  if (!profile) return redirect('/signin');

  return { profile, authData };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profileId = (await params).slug?.[0];
  const data = await getProfileAndAuthDataOrRedirect(profileId);
  return { title: data.profile.username };
}

export default async function Profile({ params }: Props) {
  const profileId = (await params).slug?.[0];
  const data = await getProfileAndAuthDataOrRedirect(profileId);
  const { profile, authData } = data;

  const postsUrl = `/posts?author=${profile.id}`;

  return (
    <>
      <Header>
        <UserProfile user={profile} />
      </Header>
      <main>
        <PostsWrapper postsUrl={postsUrl} authData={authData} />
      </main>
    </>
  );
}
