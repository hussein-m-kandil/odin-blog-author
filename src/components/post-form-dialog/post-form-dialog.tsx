'use client';

import React from 'react';
import { Post } from '@/types';
import { PostForm } from '../post-form';
import { Button } from '@/components/ui/button';
import { PenSquare, Trash2, Edit } from 'lucide-react';
import { DeletePostForm } from '../delete-post-form';
import { useDialog } from '@/contexts/dialog-context/';

export function PostFormDialog({
  post,
  showDeleteForm = false,
}: {
  post?: Post;
  showDeleteForm?: boolean;
}) {
  const toDelete = showDeleteForm && post;

  if (!toDelete && showDeleteForm) throw new Error('Missing a post to delete!');

  const { showDialog, hideDialog } = useDialog();

  const title = post
    ? showDeleteForm
      ? 'Delete Post'
      : 'Update Post'
    : 'Create a New Post';

  const verb = title.split(' ')[0].toLowerCase();

  const showPostFormDialog = () => {
    showDialog({
      title,
      description: toDelete
        ? 'You are deleting a post now! This action cannot be undone.'
        : `You can ${title.toLowerCase()} here. Click "${verb.toLowerCase()}" when you're done.`,
      body: toDelete ? (
        <DeletePostForm
          post={post}
          method='dialog'
          onCancel={hideDialog}
          onSuccess={hideDialog}
        />
      ) : (
        <PostForm post={post} onSuccess={hideDialog} aria-label={title} />
      ),
    });
  };

  return post ? (
    <Button
      type='button'
      variant='link'
      onClick={showPostFormDialog}
      className={`${
        toDelete ? 'text-destructive' : ''
      } has-[>svg]:px-0 hover:no-underline py-0 h-auto w-full justify-start font-normal`}>
      {toDelete ? <Trash2 /> : <Edit />}
      {verb} <span className='sr-only'>{post.title}</span>
    </Button>
  ) : (
    <Button
      size='icon'
      type='button'
      title={title}
      variant='outline'
      aria-label={title}
      onClick={showPostFormDialog}>
      <PenSquare />
    </Button>
  );
}

export default PostFormDialog;
