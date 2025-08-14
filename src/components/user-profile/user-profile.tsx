'use client';

import React from 'react';
import { getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { ImageForm, ImageFormProps } from '@/components/image-form';
import { UserAvatar } from '@/components/user-avatar';
import { useDialog } from '@/contexts/dialog-context';
import { Muted } from '@/components/typography/muted';
import { useAuthData } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';
import { Lead } from '@/components/typography/lead';
import { UserPen, ImageIcon } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui/button';
import { H1 } from '@/components/typography/h1';
import { AuthResData, User } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UserProfile({ owner }: { owner: User }) {
  const { showDialog, hideDialog } = useDialog();
  const router = useRouter();
  const {
    authData: { authAxios, user },
    signin,
  } = useAuthData();

  const ownedByCurrentUser = user && user.id === owner.id;

  const saveAvatar: ImageFormProps['onSuccess'] = (image) => {
    authAxios
      .patch<AuthResData>(`/users/${owner.id}`, { avatar: image?.id })
      .then(({ data }) => {
        signin(data);
        hideDialog();
        router.refresh();
        const verb = image ? 'updated' : 'deleted';
        const description = `Your avatar is ${verb} successfully`;
        toast.success(`Avatar ${verb}`, { description });
      })
      .catch((error) => {
        const description =
          parseAxiosAPIError(error).message || getUnknownErrorMessage(error);
        toast.error('Could not save your uploaded avatar', {
          action: { label: 'Try again', onClick: () => saveAvatar?.(image) },
          duration: Infinity,
          description,
        });
      });
  };

  const editAvatar = () => {
    showDialog({
      title: 'Edit Avatar',
      description: 'Choose an image, click upload, be patient, enjoy.',
      body: (
        <ImageForm
          // className='w-full mt-0'
          image={owner.avatar}
          onSuccess={saveAvatar}
        />
      ),
    });
  };

  const editProfile = () => {
    showDialog({
      title: 'Edit Profile',
      description: 'All fields are optional',
      body: (
        <AuthForm
          className='w-full mt-0'
          onSuccess={hideDialog}
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
