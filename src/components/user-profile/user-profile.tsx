'use client';

import React from 'react';
import { UserAvatar } from '@/components/user-avatar';
import { useDialog } from '@/contexts/dialog-context';
import { Muted } from '@/components/typography/muted';
import { Lead } from '@/components/typography/lead';
import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui/button';
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
      <div className='my-4 space-y-4'>
        <div>
          <H1 className='relative w-fit mx-auto wrap-anywhere'>
            {user.fullname}
          </H1>
          <Muted className='mt-1'>@{user.username}</Muted>
        </div>
        <Lead className='*:odd:text-3xl *:odd:leading-0 *:odd:relative *:odd:-bottom-1.5 space-x-1'>
          <span>🙶</span>
          <span>{user.bio || '...'}</span>
          <span>🙷</span>
        </Lead>
        <Button size='sm' type='button' variant='outline' onClick={editProfile}>
          <Edit3 />
          Edit profile
        </Button>
      </div>
    </>
  );
}

export default UserProfile;
