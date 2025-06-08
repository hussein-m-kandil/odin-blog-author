import { cn } from '@/lib/utils';
import { P } from '@/components/typography/p';

export function ErrorMessage({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  if (!children) return null;
  return (
    <P {...props} className={cn('text-destructive text-center', className)}>
      {children}
    </P>
  );
}

export default ErrorMessage;
