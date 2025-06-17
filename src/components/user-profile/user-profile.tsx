import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Muted } from '@/components/typography/muted';
import { Lead } from '@/components/typography/lead';
import { H1 } from '@/components/typography/h1';
import { User } from '@/types';
import { abbreviateFullName } from '@/lib/utils';

export function UserProfile({ user }: { user: User }) {
  return (
    <>
      <Avatar className='size-32 text-7xl mx-auto mb-2'>
        <AvatarFallback>{abbreviateFullName(user.fullname)}</AvatarFallback>
      </Avatar>
      <H1>{user.fullname}</H1>
      <Muted>@{user.username}</Muted>
      <Lead>{user.bio || '...'}</Lead>
    </>
  );
}

export default UserProfile;
