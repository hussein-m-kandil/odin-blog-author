import React from 'react';
import { Post } from '@/types';
import { useRouter } from 'next/navigation';
import { DeleteForm } from '@/components/delete-form';
import { getResErrorMessageOrThrow, getUnknownErrorMessage } from '@/lib/utils';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function DeletePostForm({
  post,
  onCancel,
  onSuccess,
  ...formProps
}: Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  onCancel: React.MouseEventHandler<HTMLButtonElement>;
  onSuccess: () => void;
  post: Post;
}) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      const apiRes = await fetch(`${apiBaseUrl}/posts/${post.id}`, {
        method: 'DELETE',
      });
      if (apiRes.ok) {
        onSuccess();
        router.replace('/blog');
      } else {
        setErrorMessage(await getResErrorMessageOrThrow(apiRes));
      }
    } catch (error) {
      setErrorMessage(getUnknownErrorMessage(error));
    }
  };

  return (
    <DeleteForm
      {...formProps}
      onCancel={onCancel}
      subject={post.title}
      onSubmit={handleSubmit}
      errorMessage={errorMessage}
    />
  );
}

export default DeletePostForm;
