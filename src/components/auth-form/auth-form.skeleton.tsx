import { Skeleton } from '@/components/ui/skeleton';
import { AuthFormProps } from './auth-form.types';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

export function AuthFormSkeleton({
  formType,
  className,
  ...props
}: React.ComponentProps<'div'> & Pick<AuthFormProps, 'formType'>) {
  return (
    <div
      {...props}
      className={cn('w-full max-w-md mx-auto mt-4 space-y-4', className)}>
      <div className='space-y-4'>
        {Array.from({ length: formType === 'signin' ? 2 : 4 }).map((_, i) => (
          <div className='space-y-2' key={i}>
            <Skeleton className='w-24 h-3 rounded-sm' />
            <Skeleton className='w-full h-8' />
          </div>
        ))}
        <Skeleton className='w-full h-8' />
      </div>
      <Separator className='my-6' />
      <div className='space-y-2'>
        <Skeleton className='w-full h-8' />
        <Skeleton className='w-full h-8' />
      </div>
    </div>
  );
}

export default AuthFormSkeleton;
