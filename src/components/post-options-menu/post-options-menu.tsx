'use client';

import React from 'react';
import { OptionsMenu } from '@/components/options-menu';
import { useQueryClient } from '@tanstack/react-query';
import { useDialog } from '@/contexts/dialog-context';
import { DeleteForm } from '@/components/delete-form';
import { PostForm } from '@/components/post-form';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import { Post } from '@/types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function PostOptionsMenu({
  post,
  menuProps,
  triggerProps,
}: Pick<
  React.ComponentProps<typeof OptionsMenu>,
  'menuProps' | 'triggerProps'
> & {
  post: Post;
}) {
  const { showDialog, hideDialog } = useDialog();
  const queryClient = useQueryClient();
  const router = useRouter();
  const id = React.useId();

  const showUpdateForm = () => {
    const formProps = {
      'aria-labelledby': `update-post-form-${id}`,
      onSuccess: hideDialog,
      post,
    };

    showDialog({
      body: <PostForm {...formProps} />,
      title: <span id={formProps['aria-labelledby']}>Update Post</span>,
      description: 'Do whatever updates on the post, then click "update".',
    });
  };

  const showDeleteForm = () => {
    const reqInit = { method: 'DELETE' };

    const formProps = {
      method: 'dialog',
      subject: post.title,
      onCancel: hideDialog,
      'aria-labelledby': `delete-post-form-${id}`,
      onSuccess: () => {
        hideDialog();
        router.replace('/');
        return queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
      delReqFn: () => fetch(`${apiBaseUrl}/posts/${post.id}`, reqInit),
    };

    showDialog({
      body: <DeleteForm {...formProps} />,
      title: <span id={formProps['aria-labelledby']}>Delete Post</span>,
      description: 'You are deleting a post now! This action cannot be undone.',
    });
  };

  const srOnlyPostTitle = <span className='sr-only'>{post.title}</span>;

  return (
    <OptionsMenu
      menuProps={{ 'aria-label': 'Post options', align: 'end', ...menuProps }}
      triggerProps={{ 'aria-label': 'Open post options', ...triggerProps }}
      menuItems={[
        <button
          type='button'
          onClick={showUpdateForm}
          key={`update-${post.id}`}>
          <Edit /> Update {srOnlyPostTitle}
        </button>,
        <button
          type='button'
          onClick={showDeleteForm}
          key={`delete-${post.id}`}
          className='text-destructive!'>
          <Trash2 /> Delete {srOnlyPostTitle}
        </button>,
      ]}
    />
  );
}

export default PostOptionsMenu;
