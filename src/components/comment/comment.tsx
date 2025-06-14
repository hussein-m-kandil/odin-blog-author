'use client';

import React from 'react';
import { OptionsMenu } from '@/components/options-menu';
import { Comment as CommentType, ID, Post } from '@/types';
import { CommentForm } from '@/components/comment-form';
import { cn } from '@/lib/utils';

export function Comment({
  currentUserId,
  className,
  comment,
  post,
  ...props
}: React.ComponentProps<'div'> & {
  comment: CommentType;
  currentUserId?: ID;
  post: Post;
}) {
  const [state, setState] = React.useState<'idle' | 'updating' | 'deleting'>(
    'idle'
  );

  const handleUpdate = () => setState('idle');

  return state === 'updating' ? (
    <CommentForm
      onSuccess={handleUpdate}
      onCancel={handleUpdate}
      comment={comment}
    />
  ) : (
    <div
      {...props}
      className={cn(
        'bg-secondary/50 py-6 px-8 rounded-md border border-input',
        'flex justify-between items-center',
        className
      )}>
      {comment.content}
      {(currentUserId === post.authorId ||
        currentUserId === comment.authorId) && (
        <OptionsMenu
          menuLabel='Comment options menu'
          menuCN='*:w-full *:text-start'
          triggerCN='w-4 overflow-hidden'
          triggerLabel='Open comment options menu'
          menuItems={
            currentUserId === comment.authorId ? (
              [
                <button
                  type='button'
                  key={`update-${comment.id}`}
                  onClick={() => setState('updating')}>
                  Update
                </button>,
                <button
                  type='button'
                  className='text-destructive!'
                  key={`delete-${comment.id}`}
                  onClick={() => setState('deleting')}>
                  Delete
                </button>,
              ]
            ) : (
              <button type='button'>Delete</button>
            )
          }
        />
      )}
    </div>
  );
}

export default Comment;
