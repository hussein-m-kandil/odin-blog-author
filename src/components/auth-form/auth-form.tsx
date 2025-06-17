'use client';

import React from 'react';
import {
  signinFormAttrs,
  signinFormSchema,
  signupFormAttrs,
  signupFormSchema,
} from './auth-form.data';
import {
  DynamicForm,
  DynamicFormProps,
  DynamicFormSubmitHandler,
} from '@/components/dynamic-form';
import { getResErrorMessageOrThrow, getUnknownErrorMessage } from '@/lib/utils';
import { ErrorMessage } from '@/components/error-message';
import { AuthFormProps } from './auth-form.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

export function AuthForm({ formLabelId, formType }: AuthFormProps) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const isSignupForm = formType === 'signup';

  const handleSubmit: DynamicFormSubmitHandler<
    z.infer<typeof signinFormSchema>
  > = async (hookForm, values) => {
    try {
      const endpoint = isSignupForm ? '/users' : '/auth/signin';
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const toastId = toast.loading(
        `Signing ${isSignupForm ? 'up' : 'in'}...`,
        { dismissible: true }
      );
      const apiRes = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        method: 'POST',
      });
      toast.dismiss(toastId);
      if (apiRes.ok) {
        // This block is just a fallback: the API route handler should redirect the user
        hookForm.reset();
        setErrorMessage('');
        router.replace('/');
        toast.success(`Hello, ${values.username}!`, {
          description: `You have signed ${
            isSignupForm ? 'up' : 'in'
          } successfully`,
        });
      } else {
        setErrorMessage(await getResErrorMessageOrThrow(apiRes, hookForm));
      }
    } catch (error) {
      setErrorMessage(getUnknownErrorMessage(error));
    }
  };

  const commonFormProps: Partial<DynamicFormProps> = {
    'aria-labelledby': formLabelId,
    submitterClassName: 'w-full',
  };

  return (
    <div className='px-4 max-w-md mx-auto mt-6'>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      {isSignupForm ? (
        <DynamicForm
          {...commonFormProps}
          onSubmit={handleSubmit}
          formAttrs={signupFormAttrs}
          formSchema={signupFormSchema}
          submitterLabel={{ idle: 'Sign up', submitting: 'Signing up...' }}
        />
      ) : (
        <DynamicForm
          {...commonFormProps}
          onSubmit={handleSubmit}
          formAttrs={signinFormAttrs}
          formSchema={signinFormSchema}
          submitterLabel={{ idle: 'Sign in', submitting: 'Signing in...' }}
        />
      )}
    </div>
  );
}

export default AuthForm;
