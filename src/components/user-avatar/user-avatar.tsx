import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { abbreviateFullName } from '@/lib/utils';
import { User } from '@/types';

export function UserAvatar({
  className,
  user,
}: {
  className?: string;
  user?: User | null;
}) {
  return (
    <Avatar className={className}>
      {user ? (
        <>
          <AvatarImage src={user.avatar || ''} alt={`@${user.username}`} />
          <AvatarFallback>{abbreviateFullName(user.fullname)}</AvatarFallback>
        </>
      ) : (
        <AvatarFallback className='text-lg'>?</AvatarFallback>
      )}
    </Avatar>
  );
}

export default UserAvatar;
