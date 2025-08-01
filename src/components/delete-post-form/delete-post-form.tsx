'use client';

import React from 'react';
import { getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthData } from '@/contexts/auth-context';
import { DeleteForm } from '@/components/delete-form';
import { Post } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function DeletePostForm({
  post,
  onSuccess,
  ...deleteFormProps
}: Omit<
  React.ComponentProps<typeof DeleteForm>,
  'subject' | 'errorMessage' | 'deleting' | 'onDelete'
> & {
  onSuccess?: () => void;
  post: Post;
}) {
  const {
    authData: { authAxios },
  } = useAuthData();
  const [errorMessage, setErrorMessage] = React.useState('');
  const queryClient = useQueryClient();
  const router = useRouter();

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      return (await authAxios.delete(`/posts/${post.id}`)).data;
    },
    onSuccess: () => {
      onSuccess?.();
      router.replace('/', { scroll: true });
      toast.success('Post deleted', {
        description: 'You have deleted the post successfully',
      });
      queryClient.removeQueries({ queryKey: ['post', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      const { message } = parseAxiosAPIError(error);
      setErrorMessage(message || getUnknownErrorMessage(error));
    },
  });

  return (
    <DeleteForm
      {...deleteFormProps}
      subject={post.title}
      errorMessage={errorMessage}
      onDelete={deletePostMutation.mutate}
      deleting={deletePostMutation.isPending}
    />
  );
}

export default DeletePostForm;
