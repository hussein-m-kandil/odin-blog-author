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
  const defaultCN = cn('text-lg', className);

  if (!user) {
    return (
      <Avatar className={defaultCN}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  let src;
  if (user.avatar) {
    const srcUrl = new URL(user.avatar.src);
    // Use image update time to revalidate the "painful" browser-cache ;)
    srcUrl.searchParams.set('updatedAt', user.avatar.updatedAt);
    src = srcUrl.href;
  }

  const alt = src ? `${user.username} avatar` : '';

  return (
    <Avatar className={defaultCN}>
      <AvatarImage
        src={src}
        alt={alt}
        style={{
          objectFit: 'cover',
          objectPosition: `50% ${user.avatar?.yPos}%`,
        }}
      />
      <AvatarFallback>{user.fullname[0].toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
