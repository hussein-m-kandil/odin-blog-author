import { cn } from '@/lib/utils';
import { Globe, Lock } from 'lucide-react';

export function PrivacyIcon({
  isPublic = false,
  size = 14,
  className,
}: React.ComponentProps<'span'> & {
  size?: string | number;
  isPublic?: boolean;
}) {
  const displayCN = 'inline-block';

  return isPublic ? (
    <span
      title='Public'
      aria-label='Public'
      className={cn(displayCN, className)}>
      <Globe className={`${displayCN}`} size={size} />
    </span>
  ) : (
    <span
      title='Private'
      aria-label='Private'
      className={cn(displayCN, className)}>
      <Lock className={`${displayCN}`} size={size} />
    </span>
  );
}

export default PrivacyIcon;
