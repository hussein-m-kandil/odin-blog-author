import { Post } from '@/types';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSignedInUser } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { PostCard } from '@/components/post-card';

export default async function Home() {
  const user = await getSignedInUser();

  if (!user) {
    return redirect('/signin');
  }

  const userPosts: Post[] = [];
  const headerStore = await headers();
  const currentUrl = headerStore.get('referer') || headerStore.get('x-url');
  if (currentUrl) {
    const userPostsPath = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${user.id}/posts`;
    const userPostsUrl = new URL(userPostsPath, new URL(currentUrl).origin);
    const userPostsRes = await fetch(userPostsUrl);
    userPosts.push(...(await userPostsRes.json()));
  }

  return (
    <>
      <header>
        <Navbar user={user} />
      </header>
      <main>
        <div className='max-w-md mx-auto mt-10 overflow-hidden space-y-12'>
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} isMutable={true} />
          ))}
        </div>
      </main>
    </>
  );
}
