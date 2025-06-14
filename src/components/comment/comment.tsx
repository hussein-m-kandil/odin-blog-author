'use client';

import React from 'react';
import { OptionsMenu } from '@/components/options-menu';
import { Comment as CommentType, ID, Post } from '@/types';
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
  return (
    <div
      {...props}
      className={cn(
        'bg-secondary/50 p-4 rounded-md border border-input',
        'flex justify-between items-center',
        className
      )}>
      {comment.content}
      {(currentUserId === post.authorId ||
        currentUserId === comment.authorId) && (
        <OptionsMenu
          menuLabel='Comment options menu'
          triggerLabel='Open comment options menu'
          menuItems={
            currentUserId === comment.authorId ? (
              [
                <button type='button' key={`update-${comment.id}`}>
                  Update
                </button>,
                <button
                  type='button'
                  key={`delete-${comment.id}`}
                  className='text-destructive'>
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
