'use client';

import React from 'react';
import { UserAvatar } from '@/components/user-avatar';
import { useDialog } from '@/contexts/dialog-context';
import { Muted } from '@/components/typography/muted';
import { useAuthData } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';
import { AvatarForm } from '@/components/avatar-form';
import { Lead } from '@/components/typography/lead';
import { UserPen, ImageIcon } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui/button';
import { H1 } from '@/components/typography/h1';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export function UserProfile({ owner }: { owner: User }) {
  const router = useRouter();
  const { showDialog, hideDialog } = useDialog();
  const {
    authData: { user },
  } = useAuthData();

  const ownedByCurrentUser = user && user.id === owner.id;

  const editAvatar = () => {
    showDialog(
      {
        title: 'Edit Avatar',
        description: 'Choose an image, click upload, be patient, enjoy.',
        body: (
          <AvatarForm
            initAvatar={owner.avatar}
            onClose={() => (router.refresh(), hideDialog())}
          />
        ),
      },
      () => (router.refresh(), true)
    );
  };

  const editProfile = () => {
    showDialog({
      title: 'Edit Profile',
      description: 'All fields are optional',
      body: (
        <AuthForm
          onSuccess={hideDialog}
          onClose={hideDialog}
          formType='update'
        />
      ),
    });
  };

  type ButtonProps = React.ComponentProps<typeof Button>;
  const createMutateBtnProps = (
    label: string,
    onClick: ButtonProps['onClick']
  ): ButtonProps => ({
    ['aria-label']: label,
    variant: 'outline',
    type: 'button',
    size: 'icon',
    onClick,
  });

  return (
    <div className='text-center max-w-xl mx-auto'>
      <div className='my-4 max-sm:block flex justify-center items-center gap-8'>
        <UserAvatar user={owner} className='size-32 text-7xl max-sm:mx-auto' />
        <Separator
          orientation='vertical'
          className='sm:min-h-32 max-sm:hidden'
        />
        <div className='flex flex-col justify-center sm:items-start sm:text-start max-sm:mt-0.5'>
          <H1 className='wrap-anywhere'>{owner.fullname}</H1>
          <Muted>@{owner.username}</Muted>
          {ownedByCurrentUser && (
            <div className='mt-2 flex justify-center gap-2'>
              <Button {...createMutateBtnProps('Edit avatar', editAvatar)}>
                <ImageIcon />
              </Button>
              <Button {...createMutateBtnProps('Edit profile', editProfile)}>
                <UserPen />
              </Button>
            </div>
          )}
        </div>
      </div>
      <Lead className='*:odd:text-3xl *:odd:leading-0 *:odd:relative *:odd:-bottom-1.5 space-x-1'>
        <span>🙶</span>
        <span>{owner.bio || '...'}</span>
        <span>🙷</span>
      </Lead>
    </div>
  );
}

export default UserProfile;
