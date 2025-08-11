'use client';

import React from 'react';
import { UserAvatar } from '@/components/user-avatar';
import { useDialog } from '@/contexts/dialog-context';
import { Muted } from '@/components/typography/muted';
import { Lead } from '@/components/typography/lead';
import { AuthForm } from '@/components/auth-form';
import { H1 } from '@/components/typography/h1';
import { Edit3 } from 'lucide-react';
import { User } from '@/types';

export function UserProfile({ user }: { user: User }) {
  const { showDialog, hideDialog } = useDialog();

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
