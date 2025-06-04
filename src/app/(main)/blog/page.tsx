import { ErrorMessage } from '@/components/error-message';
import { authedFetch, getUserId } from '@/lib/auth';
import { PostCard } from '@/components/post-card';
import { Post } from '@/types';

export default async function Blog() {
  const userId = await getUserId();

  const apiRes = await authedFetch(`/users/${userId}/posts`);

  if (!apiRes.ok) {
    return <ErrorMessage>Sorry, we could not get any posts</ErrorMessage>;
  }

  const userPosts: Post[] = await apiRes.json();

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
