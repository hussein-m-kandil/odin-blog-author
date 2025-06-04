import { ErrorMessage } from '@/components/error-message';
import { authedFetch, getUserId } from '@/lib/auth';
import { PostCard } from '@/components/post-card';
import { P } from '@/components/typography/p';
import { Post } from '@/types';

export default async function Blog() {
  const userId = await getUserId();

  const apiRes = await authedFetch(`/users/${userId}/posts`);

  if (!apiRes.ok) {
    return <ErrorMessage>Sorry, we could not get any posts</ErrorMessage>;
  }

  const userPosts: Post[] = await apiRes.json();

  if (userPosts.length < 1) {
    return <P className='text-center'>There are no posts yet</P>;
  }

  return (
    <main className='max-w-md mx-auto mt-10 px-3 space-y-12 overflow-hidden'>
      {userPosts.map((post) => (
        <PostCard key={post.id} post={post} isMutable={true} />
      ))}
    </main>
  );
}
