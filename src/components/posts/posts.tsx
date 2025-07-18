'use client';

import { useAuthData } from '@/contexts/auth-context';
import { PostCard } from '@/components/post-card';
import { useQuery } from '@tanstack/react-query';
import { H2, P } from '@/components/typography/';
import { ErrorMessage } from '../error-message';
import { cn } from '@/lib/utils';
import { Post } from '@/types';

export function Posts({
  postsUrl,
  className,
  ...containerProps
}: React.ComponentProps<'div'> & {
  postsUrl: URL | string;
}) {
  const {
    authData: { user, token },
  } = useAuthData();

  const { data, error, isLoading } = useQuery<Post[]>({
    queryKey: ['posts', postsUrl, token],
    queryFn: async () => {
      return (
        await fetch(postsUrl, { headers: { Authorization: token || '' } })
      ).json();
    },
  });

  if (error) {
    return <ErrorMessage>Sorry, we could not get any posts</ErrorMessage>;
  }

  if (isLoading) {
    // TODO: Change this into something cool like a skeleton
    return <P className='text-center'>Loading...</P>;
  }

  const posts = data;

  return posts && posts.length > 0 ? (
    <div {...containerProps} className={cn('max-w-9xl mx-auto', className)}>
      <H2 className='text-center'>Posts</H2>
      <div className='flex flex-wrap justify-center grow gap-8 my-8 px-4 *:sm:max-w-xl *:lg:max-w-md'>
        {posts.map((post) => (
          <PostCard
            isMutable={!!user && user.id === post.authorId}
            key={post.id}
            post={post}
          />
        ))}
      </div>
    </div>
  ) : (
    <P className='text-center'>There are no posts yet</P>
  );
}

export default Posts;
