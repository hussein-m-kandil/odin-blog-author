import { PostSearchSkeleton } from '@/components/post-search';
import { PostCardSkeleton } from '@/components/post-card';

export function PostsSkeleton({
  count = 3,
  ...props
}: React.ComponentProps<'div'> & { count?: number }) {
  return (
    <div {...props}>
      <PostSearchSkeleton />
      <div className='flex flex-wrap justify-center grow gap-8 px-4 *:sm:max-w-xl *:lg:max-w-md'>
        {Array.from({ length: count }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default PostsSkeleton;
