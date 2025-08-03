'use client';

import React from 'react';
import { getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '@/contexts/auth-context';
import { DeleteForm } from '@/components/delete-form';
import { Comment } from '@/types';
import { toast } from 'sonner';

export function DeleteCommentForm({
  comment,
  onSuccess,
  ...deleteFormProps
}: Omit<
  React.ComponentProps<typeof DeleteForm>,
  'subject' | 'errorMessage' | 'deleting' | 'onDelete'
> & {
  onSuccess?: () => void;
  comment: Comment;
}) {
  const {
    authData: { authAxios },
  } = useAuthData();
  const [errorMessage, setErrorMessage] = React.useState('');
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: async () => {
      const url = `/posts/${comment.postId}/comments/${comment.id}`;
      return (await authAxios.delete(url)).data;
    },
    onSuccess: () => {
      onSuccess?.();
      toast.success('Comment deleted', {
        description: 'You have deleted the comment successfully',
      });
      return queryClient.invalidateQueries({
        queryKey: ['comments', comment.postId],
      });
    },
    onError: (error) => {
      const { message } = parseAxiosAPIError(error);
      setErrorMessage(message || getUnknownErrorMessage(error));
    },
  });

  return (
    <DeleteForm
      {...deleteFormProps}
      subject={comment.content}
      errorMessage={errorMessage}
      onDelete={deleteCommentMutation.mutate}
      deleting={deleteCommentMutation.isPending}
    />
  );
}

export default DeleteCommentForm;
