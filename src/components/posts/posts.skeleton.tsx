import { PostCardSkeleton } from '@/components/post-card';
import { cn } from '@/lib/utils';

export function PostsSkeleton({
  className,
  count = 3,
  ...props
}: React.ComponentProps<'div'> & { count?: number }) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-wrap justify-center grow gap-8 px-4 *:sm:max-w-xl *:lg:max-w-md',
        className
      )}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default PostsSkeleton;
