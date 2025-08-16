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
      <div className='my-4 max-sm:block flex justify-center items-center gap-8'>
        <Skeleton className='size-32 rounded-full max-sm:mx-auto' />
        <Separator
          orientation='vertical'
          className='sm:min-h-32 max-sm:hidden'
        />
        <div className='flex flex-col justify-center sm:items-start sm:text-start max-sm:mt-0.5'>
          <Skeleton className='w-64 h-8' />
          <Skeleton className='w-24 h-4 mt-2' />
          <div className='mt-2 flex justify-center gap-2'>
            <Skeleton className='size-6 rounded-sm' />
            <Skeleton className='size-6 rounded-sm' />
          </div>
        </div>
      </div>
      <div className='mx-auto space-y-2 *:mx-auto *:h-5'>
        <Skeleton className='w-xl' />
        <Skeleton className='w-xl' />
        <Skeleton className='w-sm' />
      </div>
    </div>
  );
}

export default UserProfileSkeleton;
