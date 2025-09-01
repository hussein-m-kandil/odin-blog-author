import { User } from '@/types';
import Link from 'next/link';

type NextLinkProps = React.ComponentProps<typeof Link>;
export function UsernameLink({
  user,
  href,
  prefix = '@',
  ...props
}: Omit<NextLinkProps, 'href'> & {
  href?: NextLinkProps['href'];
  user?: User | null;
  prefix?: string;
}) {
  if (!user) return null;
  return (
    <Link {...props} href={href || `/profile/${user.username}`}>
      {prefix}
      {user.username}
    </Link>
  );
}

export default UsernameLink;
