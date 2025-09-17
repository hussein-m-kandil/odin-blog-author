import { AuthError, getServerAuthData } from '@/lib/auth';
import { PostsWrapper } from '@/components/posts-wrapper';
import { UserProfile } from '@/components/user-profile';
import { notFound, redirect } from 'next/navigation';
import { SearchParams, User } from '@/types';
import { Header } from '@/components/header';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: SearchParams;
};

const getOwnerAndAuthDataOrRedirect = async (ownerId?: string) => {
  const authData = await getServerAuthData();
  const { authFetch } = authData;

  let owner: typeof authData.user = null;
  try {
    owner = ownerId
      ? await authFetch<User>(`/users/${ownerId}`)
      : authData.user;
  } catch (error) {
    if (error instanceof AuthError) {
      const metadata = JSON.parse(error.metadata);
      if (
        metadata &&
        typeof metadata === 'object' &&
        typeof metadata.status === 'number' &&
        metadata.status >= 400 &&
        metadata.status < 500
      ) {
        return { owner, authData };
      }
      throw error;
    }
  }

  if (!owner) return redirect('/signin');

  return { owner, authData };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ownerId = (await params).slug?.[0];
  const data = await getOwnerAndAuthDataOrRedirect(ownerId);
  return { title: data.owner?.username || 'Profile' };
}

export default async function Profile({ params, searchParams }: Props) {
  const ownerId = (await params).slug?.[0];

  const data = await getOwnerAndAuthDataOrRedirect(ownerId);
  const { owner, authData } = data;

  if (!owner) return notFound();

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
