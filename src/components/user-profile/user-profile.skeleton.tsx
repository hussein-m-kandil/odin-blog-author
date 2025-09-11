import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function UserProfileSkeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      aria-label='Loading profile...'
      className={cn('text-center max-w-xl mx-auto', className)}>
      <Skeleton className='size-32 rounded-full mx-auto' />
      <div className='mt-2 flex flex-wrap justify-center items-center gap-3'>
        <Skeleton className='size-8 rounded-sm' />
        <Skeleton className='size-8 rounded-sm' />
        <Separator
          orientation='vertical'
          className='min-h-8 inline-flex align-middle'
        />
        <Skeleton className='size-8 rounded-sm' />
      </div>
      <div className='my-6'>
        <Skeleton className='w-64 h-8 mx-auto' />
        <Skeleton className='w-24 h-3 mt-2 mx-auto rounded-sm' />
      </div>
      <div className='mx-auto space-y-2 *:mx-auto *:h-4 *:rounded-sm'>
        <Skeleton className='w-xl' />
        <Skeleton className='w-xl' />
        <Skeleton className='w-sm' />
      </div>
    </div>
  );
}

export default UserProfileSkeleton;
