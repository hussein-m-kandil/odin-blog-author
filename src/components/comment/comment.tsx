'use client';

import React from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useDialog } from '@/contexts/dialog-context';
import { DeleteForm } from '@/components/delete-form';
import { OptionsMenu } from '@/components/options-menu';
import { CommentForm } from '@/components/comment-form';
import { Comment as CommentType, ID, Post } from '@/types';

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
            router.replace(`/blog/${comment.postId}`, { scroll: false });
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
        'bg-secondary/50 py-6 px-8 rounded-md border border-input',
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
