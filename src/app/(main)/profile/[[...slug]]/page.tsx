import { authedFetch, getSignedInUser } from '@/lib/auth';
import { ErrorMessage } from '@/components/error-message';
import { UserProfile } from '@/components/user-profile';
import { H2 } from '@/components/typography/h2';
import { redirect } from 'next/navigation';
import { Blogs } from '@/components/blogs';
import { Post, User } from '@/types';

export default async function Profile({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const userId = (await params).slug?.[0];

  // TODO: Replace `authedFetch` with the normal `fetch`, after remove the API restriction on getting the users
  const user = userId
    ? ((await (await authedFetch(`/users/${userId}`)).json()) as User)
    : await getSignedInUser();
  if (!user) return redirect('/signin');

  const postsRes = await authedFetch(`/users/${user.id}/posts`);
  const posts = postsRes.ok ? ((await postsRes.json()) as Post[]) : null;

  const postsHeadline = <H2 className='text-center'>Blog Posts</H2>;

  return (
    <>
      <header className='max-w-sm mx-auto my-8 text-center'>
        <UserProfile user={user} />
      </header>
      <main>
        {posts ? (
          <Blogs posts={posts} headline={postsHeadline} />
        ) : (
          <ErrorMessage>Could not get your blog posts</ErrorMessage>
        )}
      </main>
    </>
  );
}
