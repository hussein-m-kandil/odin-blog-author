'use client';

import React from 'react';
import {
  useMutation,
  InfiniteData,
  useQueryClient,
} from '@tanstack/react-query';
import { cn, getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Comment, Post, User } from '@/types';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

export function CommentForm({
  onCancel,
  onSuccess,
  comment,
  post,
  user,
  className,
  ...formProps
}: Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  onCancel?: () => void;
  onSuccess?: () => void;
  comment?: Comment | null;
  post: Post;
  user: User;
}) {
  const updating = !!comment;

  const {
    authData: { authAxios },
  } = useAuthData();
  const [content, setContent] = React.useState('');
  const [errMsg, setErrMsg] = React.useState('');

  const commentInpRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setContent(updating ? comment.content : '');
    setTimeout(() => updating && commentInpRef.current?.focus(), 100);
  }, [comment, updating]);

  const queryClient = useQueryClient();

  const { reset, mutate, isPending } = useMutation<Comment>({
    mutationFn: async () => {
      const { url, values, axiosReq } = updating
        ? {
            url: `/posts/${post.id}/comments/${comment.id}`,
            values: { content },
            axiosReq: authAxios.put,
          }
        : {
            url: `/posts/${post.id}/comments/`,
            values: { content, authorId: user.id, postId: post.id },
            axiosReq: authAxios.post,
          };
      return (await axiosReq(url, values)).data;
    },
    onSuccess: async (updatedComment) => {
      setErrMsg('');
      setContent('');
      if (updating) {
        toast.success('Comment updated', {
          description: `Your comment is updated successfully`,
        });
        queryClient.setQueryData<InfiniteData<Comment[], number>>(
          ['comments', post.id],
          (infiniteCommentsData) => {
            if (infiniteCommentsData) {
              return {
                ...infiniteCommentsData,
                pages: infiniteCommentsData.pages.map((commentPage) =>
                  commentPage.map((c) =>
                    c.id === updatedComment.id ? updatedComment : c
                  )
                ),
              };
            }
          }
        );
      } else {
        toast.success('New comment added', {
          description: `Your comment is added successfully`,
        });
        await queryClient.invalidateQueries({
          queryKey: ['comments', post.id],
        });
      }
      onSuccess?.();
    },
    onError: (error) => {
      const { message } = parseAxiosAPIError(error);
      setErrMsg(message || getUnknownErrorMessage(error));
    },
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    mutate();
  };

  const cancelUpdate = () => {
    if (updating) {
      setContent(comment.content);
      setErrMsg('');
      reset();
      onCancel?.();
    }
  };

  const handleEscapeOrEnter: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelUpdate();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      mutate();
    }
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
            size='sm'
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
          ref={commentInpRef}
          autoFocus={updating}
          aria-label='Comment'
          aria-invalid={Boolean(errMsg)}
          onKeyDown={handleEscapeOrEnter}
          onFocus={(e) => e.target.select()}
          placeholder='Reflect on what you read...'
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            'focus-visible:border-input focus-visible:ring-0',
            'focus-visible:placeholder:text-transparent',
            'resize-none rounded-none border-0'
          )}
        />
        <Button
          size='sm'
          type='submit'
          variant='outline'
          disabled={!content.trim()}
          className='focus-visible:ring-0 focus-visible:underline underline-offset-2 h-auto text-md rounded-none border-0'>
          {isPending ? (
            <>
              <Loader className='animate-spin' />{' '}
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
