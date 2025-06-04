'use client';

import React from 'react';
import { getResErrorMessageOrThrow, getUnknownErrorMessage } from '@/lib/utils';
import { createPostFormAttrs, createPostFormSchema } from './post-form.data';
import { DynamicForm, DynamicFormSubmitHandler } from '../dynamic-form';
import { PostFormProps } from './post-form.types';
import { useRouter } from 'next/navigation';
import { P } from '../typography/p';
import { Post } from '@/types';
import { z } from 'zod';

export function PostForm({ post, onSuccess, ...formProps }: PostFormProps) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const postFormAttrs = createPostFormAttrs(post);
  const postFormSchema = createPostFormSchema(postFormAttrs);

  const handleCreatePost: DynamicFormSubmitHandler<
    z.infer<typeof postFormSchema>
  > = async (hookForm, values) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const apiRes = await fetch(
        `${apiBaseUrl}/posts${post ? '/' + post.id : ''}`,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
          method: post ? 'PUT' : 'POST',
        }
      );
      if (apiRes.ok) {
        hookForm.reset();
        setErrorMessage('');
        onSuccess?.();
        const postData = post || ((await apiRes.json()) as Post);
        router.push(`/blog${postData && postData.id ? '/' + postData.id : ''}`);
      } else {
        setErrorMessage(await getResErrorMessageOrThrow(apiRes, hookForm));
      }
    } catch (error) {
      setErrorMessage(getUnknownErrorMessage(error));
    }
  };

  return (
    <>
      {errorMessage && (
        <P className='text-destructive text-sm text-center'>{errorMessage}</P>
      )}
      <DynamicForm
        {...formProps}
        formAttrs={postFormAttrs}
        formSchema={postFormSchema}
        onSubmit={handleCreatePost}
        submitterClassName='w-full'
        submitterLabel={
          post
            ? { idle: 'Update Post', submitting: 'Updating...' }
            : { idle: 'Create Post', submitting: 'Creating...' }
        }
      />
    </>
  );
}

export default PostForm;
