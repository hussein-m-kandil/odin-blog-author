import { AuthFormSkeleton } from '@/components/auth-form';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthPageSkeleton({
  formType,
  ...props
}: React.ComponentProps<typeof AuthFormSkeleton>) {
  return (
    <div {...props}>
      <Skeleton className='mt-8 w-32 h-10 mx-auto' />
      <AuthFormSkeleton formType={formType} />
    </div>
  );
}
