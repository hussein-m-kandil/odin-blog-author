import { CommentsSkeleton } from '@/components/comments';
import { MutableImageSkeleton } from '@/components/mutable-image';
import { TagsSkeleton } from '@/components/tags';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PostPageSkeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  props['aria-label'] = props['aria-label'] || 'Loading the post page';

  return (
    <div {...props} className={cn('max-w-5xl mx-auto', className)}>
      <div className='mt-6'>
        <div className='border-b-1 pb-1 space-y-2'>
          <Skeleton className='h-8 w-4/5 mx-auto' />
        </div>
        <div className='flex items-baseline justify-between mt-1'>
          {Array.from({ length: 2 }).map((_, i) => (
            <div className='flex items-center' key={i}>
              <Skeleton className='size-3 rounded-full' />
              &nbsp;
              <Skeleton className='w-24 h-2' />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div>
          <MutableImageSkeleton className='my-6' />
          <div className='mb-6 space-y-2'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton className='h-4 rounded-sm' key={i} />
            ))}
            <Skeleton className='h-4 w-3/4' />
          </div>
          <TagsSkeleton className='justify-end' />
          <div className='my-4'>
            <Skeleton className='h-6 w-32 mx-auto my-4' />
            <CommentsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostPageSkeleton;
