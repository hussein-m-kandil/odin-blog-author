import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

export function MutableImageSkeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  props['aria-label'] = props['aria-label'] || 'Loading an image';

  return (
    <Skeleton
      {...props}
      className={cn(
        'relative w-full aspect-video my-2 overflow-hidden rounded-none',
        className
      )}>
      <ImageIcon
        aria-label='Image icon'
        className='absolute top-1/2 left-1/2 -translate-1/2 w-1/3 h-1/3 stroke-1 stroke-muted-foreground opacity-10'
      />
    </Skeleton>
  );
}

export default MutableImageSkeleton;
