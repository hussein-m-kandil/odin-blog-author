'use client';

import React from 'react';
import { DeleteProfileForm } from '@/components/delete-profile-form';
import { UserPen, ImageIcon, Trash2, Quote } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';
import { useDialog } from '@/contexts/dialog-context';
import { Muted } from '@/components/typography/muted';
import { useAuthData } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';
import { Lead } from '@/components/typography/lead';
import { ImageForm } from '@/components/image-form';
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
          <ImageForm
            isAvatar={true}
            className='mt-4'
            onClose={hideDialog}
            initImage={owner.avatar?.image}
            onSuccess={() => (router.refresh(), hideDialog())}
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

  const deleteProfile = () => {
    showDialog({
      title: 'Delete Profile',
      description: (
        <span>
          <strong>WARNING!</strong> You are about to <em>permanently</em> delete
          your profile.
        </span>
      ),
      body: <DeleteProfileForm onSuccess={hideDialog} onCancel={hideDialog} />,
    });
  };

  type ButtonProps = React.ComponentProps<typeof Button>;
  const createMutateBtnProps = (
    label: string,
    onClick: ButtonProps['onClick'],
    variant: ButtonProps['variant'] = 'outline'
  ): ButtonProps => ({
    ['aria-label']: label,
    type: 'button',
    size: 'icon',
    variant,
    onClick,
  });

  return (
    <div className='text-center max-w-xl mx-auto'>
      <UserAvatar user={owner} className='size-32 text-7xl mx-auto' />
      {ownedByCurrentUser && (
        <div className='mt-2 flex flex-wrap justify-center items-center gap-3'>
          <Button {...createMutateBtnProps('Edit avatar', editAvatar)}>
            <ImageIcon />
          </Button>
          <Button {...createMutateBtnProps('Edit profile', editProfile)}>
            <UserPen />
          </Button>
          <Separator
            orientation='vertical'
            className='min-h-8 inline-flex align-middle'
          />
          <Button
            {...createMutateBtnProps(
              'Delete profile',
              deleteProfile,
              'destructive'
            )}>
            <Trash2 />
          </Button>
        </div>
      )}
      <div className='my-6'>
        <H1 className='wrap-anywhere'>{owner.fullname}</H1>
        <Muted>@{owner.username}</Muted>
      </div>
      <Lead className='*:odd:inline *:odd:size-3 *:odd:relative *:odd:-top-1.5'>
        <Quote className='rotate-y-180' />
        <span className='mx-1'>{owner.bio || '...'}</span>
        <Quote />
      </Lead>
    </div>
  );
}

export default UserProfile;
