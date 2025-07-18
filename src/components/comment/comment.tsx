'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Muted } from '@/components/typography';
import { useDialog } from '@/contexts/dialog-context';
import { DeleteForm } from '@/components/delete-form';
import { UserAvatar } from '@/components/user-avatar';
import { OptionsMenu } from '@/components/options-menu';
import { CommentForm } from '@/components/comment-form';
import { Comment as CommentType, ID, Post } from '@/types';
import { FormattedDate } from '@/components/formatted-date';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function Comment({
  currentUserId,
  className,
  comment,
  post,
  ...props
}: React.ComponentProps<'div'> & {
  currentUserId?: ID | null;
  comment: CommentType;
  post: Post;
}) {
  const [truncContent, setHideContent] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const router = useRouter();

  const { showDialog, hideDialog } = useDialog();

  const enterDelete = () => {
    showDialog({
      title: 'Delete Comment',
      description: 'Confirm deleting this comment',
      body: (
        <DeleteForm
          method='dialog'
          subject={comment.content}
          onCancel={hideDialog}
          onSuccess={() => {
            hideDialog();
            router.replace(`/${comment.postId}`, { scroll: false });
            toast.success('Comment Deleted', {
              description: 'You have deleted a comment successfully',
            });
          }}
          delReqFn={() =>
            fetch(
              `${apiBaseUrl}/posts/${comment.postId}/comments/${comment.id}`,
              { method: 'DELETE' }
            )
          }
        />
      ),
    });
  };

  const exitUpdate = () => setUpdating(false);

  const isCurrentUserCommentAuthor = currentUserId === comment.authorId;
  const isCurrentUserPostAuthor = currentUserId === post.authorId;
  const authorProfileUrl = `/profile${
    isCurrentUserCommentAuthor ? '' : '/' + comment.authorId
  }`;

  return updating ? (
    <CommentForm
      onSuccess={exitUpdate}
      onCancel={exitUpdate}
      comment={comment}
    />
  ) : (
    <div
      {...props}
      className={cn(
        'bg-secondary/50 p-4 rounded-md border border-input',
        'relative flex justify-between items-center gap-2',
        className
      )}>
      <Link href={authorProfileUrl}>
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
          <Link href={authorProfileUrl} className='w-28 truncate'>
            @{comment.author.username}
          </Link>
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
                  onClick={() => setUpdating(true)}>
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
