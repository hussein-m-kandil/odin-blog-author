import { PostCard } from '@/components/post-card';
import { P } from '@/components/typography/p';
import { cn } from '@/lib/utils';
import { Post, User } from '@/types';

export function Blogs({
  className,
  headline,
  posts,
  user,
  ...containerProps
}: React.ComponentProps<'div'> & {
  headline?: React.ReactNode;
  user?: User | null;
  posts: Post[];
}) {
  return posts.length > 0 ? (
    <div {...containerProps} className={cn('max-w-9xl mx-auto', className)}>
      {headline}
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

export default Blogs;
