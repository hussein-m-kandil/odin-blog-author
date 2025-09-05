import { Skeleton } from '@/components/ui/skeleton';
import { PostsSkeleton } from '@/components/posts';
import { cn } from '@/lib/utils';

export function PostsWrapperSkeleton({
  className,
  count = 3,
  ...props
}: React.ComponentProps<'div'> & { count?: number }) {
  return (
    <div
      {...props}
      className={cn('max-w-9xl mx-auto my-8 space-y-8', className)}>
      <Skeleton className='w-32 h-10 mx-auto' />
      <PostsSkeleton count={count} />
    </div>
  );
}

export default PostsWrapperSkeleton;
