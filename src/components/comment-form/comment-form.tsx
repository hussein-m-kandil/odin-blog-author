'use client';

import React from 'react';
import { cn, getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Comment, ID } from '@/types';
import { toast } from 'sonner';

export function CommentForm({
  postId,
  comment,
  authorId,
  onCancel,
  onSuccess,
  className,
  ...formProps
}: Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  onSuccess?: () => void;
  onCancel?: () => void;
  comment?: Comment;
  authorId?: ID;
  postId?: ID;
}) {
  if ((!authorId || !postId) && !comment) {
    throw new Error(
      'Missing either a `comment` prop or `postId` & `authorId` props'
    );
  }

  const updating = comment && true;

  if (updating && typeof onCancel !== 'function') {
    throw new Error(
      'Expect `onCancel` prop of type `function`, for update comment form'
    );
  }

  const {
    authData: { authAxios },
  } = useAuthData();
  const [content, setContent] = React.useState(updating ? comment.content : '');
  const [submitting, setSubmitting] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState('');
  const router = useRouter();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { url, values, axiosReq } = updating
        ? {
            url: `/posts/${comment.postId}/comments/${comment.id}`,
            values: { content },
            axiosReq: authAxios.put,
          }
        : {
            url: `/posts/${postId}/comments/`,
            values: { content, authorId, postId },
            axiosReq: authAxios.post,
          };
      await axiosReq(url, values);
      setErrMsg('');
      setContent('');
      router.replace(`/${updating ? comment.postId : postId}`, {
        scroll: false,
      });
      toast.success(updating ? 'Comment Updated' : 'New Comment Added', {
        description: `You have ${
          updating ? 'updated a' : 'added a new'
        } comment successfully`,
      });
      onSuccess?.();
    } catch (error) {
      const { message } = parseAxiosAPIError(error);
      if (!message) getUnknownErrorMessage(error); // Just to log it
      setErrMsg(message || 'Sorry, you can not comment right now');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelUpdate = () => {
    if (updating) {
      setErrMsg('');
      setContent(comment.content);
      if (typeof onCancel === 'function') onCancel();
    }
  };

  const handleEscape: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Escape') cancelUpdate();
  };

  return (
    <form
      {...formProps}
      onSubmit={handleSubmit}
      className={cn('my-4', className)}
      aria-label={updating ? 'Update Comment' : 'Create Comment'}>
      <ErrorMessage className='text-start text-sm ps-4 m-0!'>
        {errMsg}
      </ErrorMessage>
      <div
        className={cn(
          'focus-within:ring-3 focus-within:ring-ring/25 transition-all flex rounded-md',
          'rounded-lg border border-input overflow-hidden has-aria-[invalid="true"]:border-destructive'
        )}>
        {updating && (
          <Button
            type='button'
            variant='outline'
            onClick={cancelUpdate}
            className='focus-visible:ring-0 focus-visible:underline underline-offset-2 h-auto text-md rounded-none border-0'>
            Cancel
          </Button>
        )}
        <Textarea
          name='comment'
          value={content}
          aria-label='Comment'
          autoFocus={updating}
          onKeyDown={handleEscape}
          aria-invalid={Boolean(errMsg)}
          onFocus={(e) => e.target.select()}
          placeholder='Reflect on what you read...'
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            'placeholder:pt-3 focus-visible:placeholder:text-transparent',
            'focus-visible:border-input focus-visible:ring-0',
            'resize-none min-h-17 h-17 rounded-none border-0'
          )}
        />
        <Button
          type='submit'
          variant='outline'
          className='focus-visible:ring-0 focus-visible:underline underline-offset-2 h-auto text-md rounded-none border-0'>
          {submitting ? (
            <>
              <Loader2 className='animate-spin' />{' '}
              {updating ? 'Updating' : 'Commenting'}
            </>
          ) : updating ? (
            'Update'
          ) : (
            'Comment'
          )}
        </Button>
      </div>
    </form>
  );
}

export default CommentForm;
