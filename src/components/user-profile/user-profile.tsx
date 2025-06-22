'use client';

import React from 'react';
import { AuthForm, AuthFormProps } from '@/components/auth-form';
import { UserAvatar } from '@/components/user-avatar';
import { useDialog } from '@/contexts/dialog-context';
import { Muted } from '@/components/typography/muted';
import { Lead } from '@/components/typography/lead';
import { H1 } from '@/components/typography/h1';
import { useRouter } from 'next/navigation';
import { Edit3 } from 'lucide-react';
import { User } from '@/types';

export function UserProfile({ user }: { user: User }) {
  const { showDialog, hideDialog } = useDialog();
  const router = useRouter();
  const id = React.useId();

  const editFormProps: AuthFormProps = {
    onSuccess: () => (hideDialog(), router.refresh()),
    formLabelId: `edit-profile-form-${id}`,
    formType: 'signup',
    user,
  };

  const editProfile = () => {
    showDialog({
      description: 'Edit your profile while considering all fields as optional',
      title: <span id={editFormProps.formLabelId}>Edit Profile</span>,
      body: <AuthForm {...editFormProps} className='w-full mt-0' />,
    });
  };

  return (
    <>
      <UserAvatar user={user} className='size-32 text-7xl mx-auto mb-2' />
      <H1 className='relative w-fit mx-auto'>
        {user.fullname}
        <button
          type='button'
          onClick={editProfile}
          aria-label='Edit profile'
          className='absolute bottom-1.5 -right-8 cursor-pointer focus-visible:outline-none focus-visible:border-b-1 hover:border-b border-b-foreground h-6'>
          <Edit3 size={24} />
        </button>
      </H1>
      <Muted>@{user.username}</Muted>
      <Lead>{user.bio || '...'}</Lead>
    </>
  );
}

export default UserProfile;
