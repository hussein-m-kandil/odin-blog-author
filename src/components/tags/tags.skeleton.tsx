import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function TagsSkeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  props['aria-label'] = props['aria-label'] || 'Loading the post tags';
  return (
    <div
      {...props}
      className={cn(
        'flex flex-wrap justify-between content-center space-x-2 space-y-2',
        className
      )}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton className='h-9 w-24 rounded-4xl' key={i} />
      ))}
    </div>
  );
}

export default TagsSkeleton;
