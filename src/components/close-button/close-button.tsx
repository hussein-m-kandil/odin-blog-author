import { Button } from '@/components/ui/button';
import { PanelLeftClose } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CloseButton({
  onClose,
  type,
  variant,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'onClick'> & {
  onClose: (() => void) | undefined | null;
}) {
  return onClose ? (
    <Button
      {...props}
      onClick={onClose}
      type={type || 'button'}
      variant={variant || 'outline'}
      className={cn('w-full', className)}>
      {children || (
        <>
          <PanelLeftClose /> Close
        </>
      )}
    </Button>
  ) : null;
}

export default CloseButton;
