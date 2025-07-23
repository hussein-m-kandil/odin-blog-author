import { Skeleton } from '../ui/skeleton';

export function CommentsSkeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  props['aria-label'] = props['aria-label'] || 'Loading the post comments';

  return (
    <div {...props} className={className}>
      <Skeleton className='h-20 mb-4' />
      <div className='space-y-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton className='h-16' key={i} />
        ))}
      </div>
    </div>
  );
}

export default CommentsSkeleton;
