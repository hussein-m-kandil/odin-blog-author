'use client';

import React from 'react';
import { OptionsMenu } from '@/components/options-menu';
import { useDialog } from '@/contexts/dialog-context';
import { DeletePostForm } from '../delete-post-form';
import { Edit, Trash2 } from 'lucide-react';
import { Post } from '@/types';
import { usePostFormDialog } from '@/hooks/use-post-form-dialog';

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
  const { showPostForm } = usePostFormDialog({ post });

  const { showDialog, hideDialog } = useDialog();

  const showDeleteForm = () => {
    showDialog({
      title: 'Delete Post',
      description: 'You are deleting a post now! This action cannot be undone.',
      body: (
        <DeletePostForm
          post={post}
          onCancel={hideDialog}
          onSuccess={hideDialog}
        />
      ),
    });
  };

  const srOnlyPostTitle = <span className='sr-only'>{post.title}</span>;

  return (
    <OptionsMenu
      menuProps={{ 'aria-label': 'Post options', align: 'end', ...menuProps }}
      triggerProps={{ 'aria-label': 'Open post options', ...triggerProps }}
      menuItems={[
        <button type='button' onClick={showPostForm} key={`update-${post.id}`}>
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
