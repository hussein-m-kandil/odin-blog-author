'use client';

import React from 'react';
import logger from '@/lib/logger';
import { ErrorMessage } from '@/components/error-message';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';
import { Comment, ID } from '@/types';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface CommentFormPropsBase
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSuccess?: () => void;
}

export interface CreateCommentFormProps extends CommentFormPropsBase {
  authorId: ID;
  postId: ID;
}
export interface UpdateCommentFormProps extends CommentFormPropsBase {
  comment: Comment;
  onCancel: () => void;
}

export function CommentForm({
  comment,
  postId,
  authorId,
  className,
  onSuccess,
  ...formProps
}: CreateCommentFormProps | UpdateCommentFormProps) {
  if ((!authorId || !postId) && !comment) {
    throw Error(
      'Missing either a `comment` prop or `postId` & `authorId` props'
    );
  }

  const [content, setContent] = React.useState(comment?.content || '');
  const [submitting, setSubmitting] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState('');

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async () => {
    setSubmitting(true);
    try {
      const commentMetadata = comment
        ? {
            endpoint: `/posts/${comment.postId}/comments/${comment.id}`,
            values: { content },
            method: 'PUT',
          }
        : {
            endpoint: `/posts/${postId}/comments/`,
            values: { content, authorId, postId },
            method: 'POST',
          };
      const apiRes = await fetch(`${apiBaseUrl}${commentMetadata.endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentMetadata.values),
        method: commentMetadata.method,
      });
      if (!apiRes.ok) throw apiRes;
      setContent('');
      setErrMsg('');
      onSuccess?.();
    } catch (error) {
      logger.error(error?.toString?.() || 'Comment error', error);
      setErrMsg('Sorry, you can not comment right now');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      {...formProps}
      onSubmit={handleSubmit}
      className={cn(
        'focus-within:ring-3 focus-within:ring-ring/25 transition-all',
        'flex rounded-md my-4',
        className
      )}
      aria-label={comment ? 'Update Comment' : 'Create Comment'}>
      <ErrorMessage>{errMsg}</ErrorMessage>
      <Textarea
        name='comment'
        value={content}
        aria-label='Comment'
        placeholder='Reflect on what you read...'
        onChange={(e) => setContent(e.target.value)}
        className={cn(
          'rounded-r-none border-r-0 focus-visible:border-input focus-visible:ring-0',
          'placeholder:pt-3 focus-visible:placeholder:text-transparent',
          'resize-none min-h-17 h-17'
        )}
      />
      <span className='flex'>
        {comment && (
          <Button
            type='button'
            variant='outline'
            className={cn(
              'focus-visible:ring-0 focus-visible:underline underline-offset-2',
              'h-auto text-md rounded-none border-x-0'
            )}>
            Cancel
          </Button>
        )}
        <Button
          type='submit'
          variant='outline'
          className={cn(
            'focus-visible:ring-0 focus-visible:underline underline-offset-2',
            'h-auto text-md rounded-l-none border-l-0'
          )}>
          {submitting ? (
            <>
              <Loader2 className='animate-spin' /> Commenting
            </>
          ) : (
            'Comment'
          )}
        </Button>
      </span>
    </form>
  );
}

export default CommentForm;
