import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, setURlParams } from '@/lib/utils';
import { User } from '@/types';

export function UserAvatar({
  className,
  user,
}: {
  className?: string;
  user?: User | null;
}) {
  const defaultCN = cn('text-lg', className);

  if (!user) {
    return (
      <Avatar className={defaultCN}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  // Use image update time to revalidate the "painful" browser-cache ;)
  const src = user.avatar
    ? setURlParams(user.avatar.image.src, {
        updatedAt: user.avatar.image.updatedAt,
      })
    : undefined;

  const alt = src ? `${user.username} avatar` : '';

  return (
    <Avatar className={defaultCN}>
      <AvatarImage
        src={src}
        alt={alt}
        style={{
          objectFit: 'cover',
          objectPosition: `50% ${user.avatar?.image.yPos || 50}%`,
        }}
      />
      <AvatarFallback>{user.fullname[0].toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
