import { ErrorMessage } from '@/components/error-message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function QueryError({
  onRefetch,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  onRefetch: () => void;
}) {
  return (
    <div {...props} className={cn('text-center space-y-2', className)}>
      <ErrorMessage>
        {children || 'Sorry, we could not load the data'}
      </ErrorMessage>
      <Button
        autoFocus
        size='sm'
        type='button'
        variant='outline'
        onClick={onRefetch}
        className='scroll-m-4'>
        Try again
      </Button>
    </div>
  );
}

export default QueryError;
