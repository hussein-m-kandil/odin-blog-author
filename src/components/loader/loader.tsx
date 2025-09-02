import { cn } from '@/lib/utils';
import { Loader2 as LoaderIcon } from 'lucide-react';

export function Loader({
  className,
  ...props
}: React.ComponentProps<typeof LoaderIcon>) {
  if (!props['aria-label']) props['aria-label'] = 'Loading...';
  return <LoaderIcon {...props} className={cn('animate-spin', className)} />;
}

export default Loader;
