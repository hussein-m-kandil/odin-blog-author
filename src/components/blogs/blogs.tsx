import { PostCard } from '@/components/post-card';
import { P } from '@/components/typography/p';
import { cn } from '@/lib/utils';
import { Post } from '@/types';

export function Blogs({
  className,
  headline,
  posts,
  ...containerProps
}: React.ComponentProps<'div'> & {
  headline?: React.ReactNode;
  posts: Post[];
}) {
  return posts.length > 0 ? (
    <div {...containerProps} className={cn('max-w-9xl mx-auto', className)}>
      {headline}
      <div className='flex flex-wrap justify-center grow gap-8 my-8 px-4 *:sm:max-w-xl *:lg:max-w-md'>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} isMutable={true} />
        ))}
      </div>
    </div>
  ) : (
    <P className='text-center'>There are no posts yet</P>
  );
}

export default Blogs;
