import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PostCardSkeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  props['aria-label'] = props['aria-label'] || 'Loading a post';

  return (
    <Card
      {...props}
      className={cn(
        'w-full **:rounded-sm flex-col justify-between gap-4',
        className
      )}>
      <CardHeader>
        <CardTitle>
          <Skeleton className='h-4' />
        </CardTitle>
        <CardDescription className='italic truncate'>
          <Skeleton className='h-2 w-[25%]' />
        </CardDescription>
      </CardHeader>
      <CardContent className='mt-auto p-0'>
        <Skeleton className='relative aspect-video' />
        <div className='space-y-2 my-4 px-6'>
          <Skeleton className='h-4' />
          <Skeleton className='h-4' />
          <Skeleton className='h-4 w-[85%]' />
        </div>
      </CardContent>
      <CardFooter className='flex items-center justify-between'>
        <Skeleton className='h-2 w-[25%]' />
        <Skeleton className='h-10 w-10 rounded-lg!' />
      </CardFooter>
    </Card>
  );
}

export default PostCardSkeleton;
