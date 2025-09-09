import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

export function AppStatsSkeleton({
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) {
  if (!props['aria-label'] && !props['aria-labelledby']) {
    props['aria-label'] = 'Loading app statistics';
  }

  return <Skeleton {...props} className={cn('h-105 rounded-2xl', className)} />;
}

export default AppStatsSkeleton;
