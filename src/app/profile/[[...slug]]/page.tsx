import { PostsWrapper } from '@/components/posts-wrapper';
import { UserProfile } from '@/components/user-profile';
import { SearchParams, User } from '@/types';
import { getServerAuthData } from '@/lib/auth';
import { Header } from '@/components/header';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: SearchParams;
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

export default async function Profile({ params, searchParams }: Props) {
  const ownerId = (await params).slug?.[0];

  const data = await getOwnerAndAuthDataOrRedirect(ownerId);
  const { owner, authData } = data;

  return (
    <>
      <Header>
        <UserProfile owner={owner} />
      </Header>
      <main>
        <PostsWrapper
          searchParams={{ ...(await searchParams), author: owner.id }}
          authData={authData}
        />
      </main>
    </>
  );
}
