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

const getOwnerAndAuthDataOrRedirect = async (ownerId?: string) => {
  const authData = await getServerAuthData();
  const { authFetch } = authData;

  const owner = ownerId
    ? await authFetch<User>(`/users/${ownerId}`)
    : authData.user;

  if (!owner) return redirect('/signin');

  return { owner, authData };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ownerId = (await params).slug?.[0];
  const data = await getOwnerAndAuthDataOrRedirect(ownerId);
  return { title: data.owner.username };
}

export default async function Profile({ params }: Props) {
  const ownerId = (await params).slug?.[0];
  const data = await getOwnerAndAuthDataOrRedirect(ownerId);
  const { owner, authData } = data;

  const postsUrl = `/posts?author=${owner.id}`;

  return (
    <>
      <Header>
        <UserProfile owner={owner} />
      </Header>
      <main>
        <PostsWrapper postsUrl={postsUrl} authData={authData} />
      </main>
    </>
  );
}
