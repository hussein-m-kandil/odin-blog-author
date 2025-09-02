'use client';

import React from 'react';
import {
  Form,
  FormItem,
  FormField,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import {
  useMutation,
  InfiniteData,
  useQueryClient,
} from '@tanstack/react-query';
import { cn, getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthData } from '@/contexts/auth-context';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Comment, Post, User } from '@/types';
import { Loader } from '@/components/loader';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const ERR_MSG = 'Missing a comment value';

const formSchema = z.object({
  content: z.string().trim().min(1, { message: ERR_MSG }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CommentForm({
  onSuccess,
  onCancel,
  comment,
  post,
  user,
  className,
  ...formProps
}: Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  onSuccess?: (comment: Comment) => void;
  onCancel?: () => void;
  comment?: Comment | null;
  post: Post;
  user: User;
}) {
  const updating = !!comment;

  const {
    authData: { authAxios },
  } = useAuthData();

  const hookForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: updating ? comment.content : '' },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation<Comment, Error, FormValues>({
    mutationFn: async ({ content }) => {
      if (updating && comment.content === content) return comment;
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
    onSuccess: (resComment) => {
      hookForm.setValue('content', '');
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
                    c.id === resComment.id ? resComment : c
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
      }
      onSuccess?.(resComment);
      return queryClient.invalidateQueries({
        queryKey: ['comments', post.id],
      });
    },
    onError: (error) => {
      const { message } = parseAxiosAPIError(error, hookForm);
      hookForm.setError('content', {
        message: message || getUnknownErrorMessage(error),
      });
    },
  });

  const cancelUpdate = () => {
    if (updating) {
      hookForm.reset();
      mutation.reset();
      onCancel?.();
    }
  };

  const submit = (values: FormValues) => mutation.mutate(values);

  const handleKeyboardEvent: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === 'Enter' && !e.shiftKey && hookForm.formState.isValid) {
      e.preventDefault();
      submit(hookForm.getValues());
    } else if (e.key === 'Escape' && updating) {
      e.preventDefault();
      cancelUpdate();
    }
  };

  return (
    <Form {...hookForm}>
      <form
        {...formProps}
        aria-label={updating ? 'Update Comment' : 'Create Comment'}
        className={cn(
          'my-4 focus-within:ring-3 focus-within:ring-ring/25 transition-all rounded-lg bg-input/50',
          'border border-input overflow-hidden has-aria-[invalid="true"]:border-destructive',
          className
        )}
        onSubmit={hookForm.handleSubmit(submit)}>
        <FormField
          control={hookForm.control}
          name='content'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormMessage className='absolute top-1 left-3 right-3 text-center' />
              <FormControl>
                <Textarea
                  {...field}
                  aria-label='Comment'
                  autoFocus={updating}
                  onKeyDown={handleKeyboardEvent}
                  onFocus={(e) => e.target.select()}
                  placeholder='Reflect on what you read...'
                  className={cn(
                    'focus-visible:border-input focus-visible:ring-0 focus-visible:placeholder:text-transparent',
                    'resize-none rounded-none border-0 bg-transparent dark:bg-transparent min-h-12 pt-5'
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className='flex border-1 *:grow'>
          {updating && (
            <Button
              size='sm'
              type='button'
              variant='outline'
              onClick={cancelUpdate}
              className='border-none rounded-none rounded-bl-md'>
              Cancel
            </Button>
          )}
          <Button
            size='sm'
            type='submit'
            variant='outline'
            disabled={!hookForm.formState.isValid}
            className={cn(
              'ms-auto border-none rounded-none rounded-br-md',
              !updating && 'rounded-bl-md'
            )}>
            {mutation.isPending ? (
              <>
                <Loader /> {updating ? 'Updating' : 'Commenting'}
              </>
            ) : updating ? (
              'Update'
            ) : (
              'Comment'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CommentForm;
