'use client';

import React from 'react';
import { OptionsMenu } from '@/components/options-menu';
import { useDialog } from '@/contexts/dialog-context';
import { DeleteForm } from '@/components/delete-form';
import { PostForm } from '@/components/post-form';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import { Post } from '@/types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function PostOptionsMenu({
  post,
  menuCN,
  triggerCN,
}: {
  post: Post;
  menuCN?: string;
  triggerCN?: string;
}) {
  const { showDialog, hideDialog } = useDialog();
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
      onSuccess: () => (hideDialog(), router.replace('/blog')),
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
      menuCN={menuCN}
      triggerCN={triggerCN}
      menuLabel='Post options menu'
      triggerLabel='Open post options menu'
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
