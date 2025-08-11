import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from '@/types';

export function UserAvatar({
  className,
  user,
}: {
  className?: string;
  user?: User | null;
}) {
  return (
    <Avatar className={cn('text-lg', className)}>
      {user ? (
        <>
          <AvatarImage src={user.avatar || ''} alt={`@${user.username}`} />
          <AvatarFallback>{user.fullname[0]?.toUpperCase()}</AvatarFallback>
        </>
      ) : (
        <AvatarFallback>?</AvatarFallback>
      )}
    </Avatar>
  );
}

export default UserAvatar;
