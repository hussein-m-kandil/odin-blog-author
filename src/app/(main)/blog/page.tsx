import { PostCard } from '@/components/post-card';
import { headers } from 'next/headers';
import { Post } from '@/types';
import { ErrorMessage } from '@/components/error-message';

const defaultErrMsg = 'Sorry, we could not get any posts';

export default async function Home() {
  const userPosts: Post[] = [];

  const headerStore = await headers();

  const userId = headerStore.get('x-uid');
  const currentUrl = headerStore.get('referer') || headerStore.get('x-url');

  if (!userId || !currentUrl)
    return <ErrorMessage>{defaultErrMsg}</ErrorMessage>;

  const userPostsPath = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}/posts`;
  const userPostsUrl = new URL(userPostsPath, new URL(currentUrl).origin);

  const apiRes = await fetch(userPostsUrl, {
    headers: { ...Object.fromEntries(headerStore.entries()) },
  });

  if (!apiRes.ok) return <ErrorMessage>{defaultErrMsg}</ErrorMessage>;

  userPosts.push(...(await apiRes.json()));

  return (
    <main>
      <div className='max-w-md mx-auto mt-10 overflow-hidden space-y-12'>
        {userPosts.map((post) => (
          <PostCard key={post.id} post={post} isMutable={true} />
        ))}
      </div>
    </main>
  );
}
