import { ErrorMessage } from '@/components/error-message';
import { H1 } from '@/components/typography/h1';
import { Blogs } from '@/components/blogs';
import { authedFetch, getSignedInUser } from '@/lib/auth';
import { Post } from '@/types';

export default async function Blog() {
  const user = await getSignedInUser();

  const apiRes = await authedFetch('/posts');

  if (!apiRes.ok) {
    return <ErrorMessage>Sorry, we could not get any posts</ErrorMessage>;
  }

  const posts: Post[] = await apiRes.json();

  const postsHeadline = (
    <H1 className='text-center mt-8 border-b pb-3'>Blog Posts</H1>
  );

  return (
    <main>
      <Blogs user={user} posts={posts} headline={postsHeadline} />
    </main>
  );
}
