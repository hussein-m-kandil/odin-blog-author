import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PostSearchSkeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('max-w-lg mx-auto space-y-2', className)}>
      <Skeleton className='w-full h-8' />
      <div className='my-4 flex justify-center gap-4'>
        <Skeleton className='w-16 h-8' />
        <Skeleton className='size-8' />
      </div>
    </div>
  );
}

export default PostSearchSkeleton;
