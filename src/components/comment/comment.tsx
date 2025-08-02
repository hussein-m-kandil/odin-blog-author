'use client';

import React from 'react';
import Link from 'next/link';
import { FormattedDate } from '@/components/formatted-date';
import { DeleteCommentForm } from '../delete-comment-form';
import { Comment as CommentT, Post, User } from '@/types';
import { UsernameLink } from '@/components/username-link';
import { OptionsMenu } from '@/components/options-menu';
import { UserAvatar } from '@/components/user-avatar';
import { useDialog } from '@/contexts/dialog-context';
import { Muted } from '@/components/typography';
import { cn } from '@/lib/utils';

export function Comment({
  onUpdate,
  comment,
  post,
  user,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  onUpdate: (comment: CommentT) => void;
  comment: CommentT;
  post: Post;
  user?: User | null;
}) {
  const [truncContent, setHideContent] = React.useState(true);
  const { showDialog, hideDialog } = useDialog();

  const enterUpdate = () => onUpdate(comment);

  const enterDelete = () => {
    const deleteTitleId = `delete-comment-${comment.id}`;
    showDialog({
      title: <span id={deleteTitleId}>Delete Comment</span>,
      description: 'Confirm deleting this comment',
      body: (
        <DeleteCommentForm
          method='dialog'
          comment={comment}
          onCancel={hideDialog}
          onSuccess={hideDialog}
          aria-labelledby={deleteTitleId}
        />
      ),
    });
  };

  const isCurrentUserCommentAuthor = user && user.id === comment.authorId;
  const isCurrentUserPostAuthor = user && user.id === post.authorId;

  return (
    <div
      {...props}
      className={cn(
        'bg-secondary/50 p-4 rounded-md border border-input',
        'relative flex justify-between items-center gap-2',
        className
      )}>
      <Link
        href={`/profile${
          isCurrentUserCommentAuthor ? '' : '/' + comment.authorId
        }`}>
        <UserAvatar user={comment.author} className='size-12 text-lg' />
      </Link>
      <div className='grow font-light'>
        <div className='text-foreground italic'>
          <button
            type='button'
            className={cn(
              'text-start cursor-pointer',
              truncContent && 'line-clamp-1'
            )}
            onClick={() => setHideContent(!truncContent)}>
            {comment.content}
          </button>
        </div>
        <Muted className='flex justify-between items-end border-t pt-1 mt-1 *:text-xs'>
          <UsernameLink user={comment.author} className='w-28 truncate' />
          <FormattedDate
            createdAt={comment.createdAt}
            updatedAt={comment.updatedAt}
          />
        </Muted>
      </div>
      {(isCurrentUserPostAuthor || isCurrentUserCommentAuthor) && (
        <OptionsMenu
          menuProps={{ 'aria-label': 'Comment options menu', align: 'end' }}
          triggerProps={{
            'aria-label': 'Open comment options menu',
            className: 'absolute top-3 right-3',
          }}
          menuItems={
            isCurrentUserCommentAuthor ? (
              [
                <button
                  type='button'
                  key={`update-${comment.id}`}
                  onClick={enterUpdate}>
                  Update
                </button>,
                <button
                  type='button'
                  onClick={enterDelete}
                  key={`delete-${comment.id}`}
                  className='text-destructive!'>
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
