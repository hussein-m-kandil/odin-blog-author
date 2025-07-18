import { cn } from '@/lib/utils';

export function Header({
  className,
  children,
  ...props
}: React.ComponentProps<'header'>) {
  return (
    <header
      {...props}
      className={cn('max-w-sm mx-auto my-8 text-center', className)}>
      {children}
    </header>
  );
}

export default Header;
