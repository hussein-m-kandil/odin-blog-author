'use client';

import React from 'react';
import {
  signinFormAttrs,
  signupFormAttrs,
  refineSignupSchema,
  updateUserFormAttrs,
} from './auth-form.data';
import {
  DynamicForm,
  DynamicFormSubmitHandler,
  injectDefaultValuesInDynamicFormAttrs as injectDefaults,
  transformDynamicFormAttrsIntoSchema as createSchema,
} from '@/components/dynamic-form';
import {
  cn,
  getResErrorMessageOrThrow,
  getUnknownErrorMessage,
} from '@/lib/utils';
import { ErrorMessage } from '@/components/error-message';
import { AuthFormProps } from './auth-form.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

export function AuthForm({
  formLabelId,
  className,
  formType,
  user,
  onSuccess,
}: AuthFormProps) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const formData =
    formType === 'signin'
      ? {
          props: {
            formAttrs: signinFormAttrs,
            formSchema: createSchema(signinFormAttrs),
            submitterLabel: { idle: 'Sign in', submitting: 'Signing in...' },
          },
          showToast: (username: string) =>
            toast.success(`Hello, @${username}!`, {
              description: `You have signed in successfully`,
            }),
          endpoint: '/auth/signin',
          method: 'POST',
          name: 'user',
        }
      : user
      ? {
          props: {
            formAttrs: injectDefaults(updateUserFormAttrs, user),
            formSchema: refineSignupSchema(createSchema(updateUserFormAttrs)),
            submitterLabel: { idle: 'Update', submitting: 'Updating...' },
          },
          showToast: (username: string) =>
            toast.success(`@${username} updated`, {
              description: 'Your profile is updated successfully',
            }),
          endpoint: `/users/${user.id}`,
          method: 'PATCH',
          name: user.username,
        }
      : {
          props: {
            formAttrs: signupFormAttrs,
            formSchema: refineSignupSchema(createSchema(signupFormAttrs)),
            submitterLabel: { idle: 'Sign up', submitting: 'Signing up...' },
          },
          showToast: (username: string) =>
            toast.success(`Hello, @${username}!`, {
              description: `You have signed up successfully`,
            }),
          endpoint: '/users',
          method: 'POST',
          name: 'user',
        };

  const handleSubmit: DynamicFormSubmitHandler<
    z.infer<typeof formData.props.formSchema>
  > = async (hookForm, values) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const apiRes = await fetch(`${apiBaseUrl}${formData.endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        method: formData.method,
      });
      if (apiRes.ok) {
        hookForm.reset();
        setErrorMessage('');
        if (onSuccess) onSuccess();
        else router.replace('/');
        formData.showToast(values.username || formData.name);
      } else {
        setErrorMessage(await getResErrorMessageOrThrow(apiRes, hookForm));
      }
    } catch (error) {
      setErrorMessage(getUnknownErrorMessage(error));
    }
  };

  return (
    <div className={cn('px-4 max-w-md mx-auto mt-6', className)}>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <DynamicForm
        aria-labelledby={formLabelId}
        submitterClassName='w-full'
        onSubmit={handleSubmit}
        {...formData.props}
      />
    </div>
  );
}

export default AuthForm;
