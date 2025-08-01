'use client';

import React from 'react';
import { OptionsMenu } from '@/components/options-menu';
import { useDialog } from '@/contexts/dialog-context';
import { DeletePostForm } from '../delete-post-form';
import { PostForm } from '@/components/post-form';
import { Edit, Trash2 } from 'lucide-react';
import { Post } from '@/types';

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

  const showUpdateForm = () => {
    const titleId = `post-opts-update-form-${post.id}`;
    showDialog({
      body: (
        <PostForm
          post={post}
          onSuccess={hideDialog}
          aria-labelledby={titleId}
        />
      ),
      title: <span id={titleId}>Update Post</span>,
      description: 'Do whatever updates on the post, then click "update".',
    });
  };

  const showDeleteForm = () => {
    const titleId = `post-opts-delete-form-${post.id}`;
    showDialog({
      body: (
        <DeletePostForm
          post={post}
          method='dialog'
          onCancel={hideDialog}
          onSuccess={hideDialog}
          aria-labelledby={titleId}
        />
      ),
      title: <span id={titleId}>Delete Post</span>,
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
