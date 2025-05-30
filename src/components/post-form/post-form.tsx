'use client';

import React from 'react';
import logger from '@/lib/logger';
import {
  getErrorMessageOrThrow,
  isIssue,
  parseIssues,
  showFieldErrors,
} from '@/lib/utils';
import { DynamicForm, DynamicFormSubmitHandler } from '../dynamic-form';
import { createPostFormAttrs, createPostFormSchema } from './post-form.data';
import { PostFormProps } from './post-form.types';
import { P } from '../typography/p';
import { z } from 'zod';

export function PostForm({ post, onSuccess, ...formProps }: PostFormProps) {
  const [errorMessage, setErrorMessage] = React.useState('');

  const postFormAttrs = createPostFormAttrs(post);
  const postFormSchema = createPostFormSchema(postFormAttrs);

  const handleCreatePost: DynamicFormSubmitHandler<
    z.infer<typeof postFormSchema>
  > = async (hookForm, values) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const apiRes = await fetch(`${apiBaseUrl}/posts`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        method: 'POST',
      });
      if (apiRes.ok) {
        hookForm.reset();
        setErrorMessage('');
        onSuccess?.();
      } else {
        const data = await apiRes.json();
        if (Array.isArray(data) && data.every(isIssue)) {
          const { formErrors, fieldErrors } = parseIssues(data);
          if (formErrors.length) setErrorMessage(formErrors[0]);
          showFieldErrors(hookForm, fieldErrors);
        } else {
          setErrorMessage(getErrorMessageOrThrow(data));
        }
      }
    } catch (error) {
      const defaultMessage = 'An error occurred while creating a post';
      logger.error(error?.toString() ?? defaultMessage, error);
      setErrorMessage('Something went wrong, please try again later');
    }
  };

  return (
    <>
      {errorMessage && (
        <P className='text-destructive text-sm text-center mt-0 mb-5'>
          {errorMessage}
        </P>
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
