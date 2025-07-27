import { ErrorMessage } from '@/components/error-message';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function QueryError({
  onRefetch,
  className,
  message,
  ...props
}: React.ComponentProps<'div'> & {
  onRefetch: () => void;
  message?: string;
}) {
  return (
    <div {...props} className={cn('text-center', className)}>
      <ErrorMessage>
        {message || 'Sorry, we could not load the data'}
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
