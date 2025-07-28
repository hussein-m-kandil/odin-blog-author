'use client';

import React from 'react';
import {
  DynamicForm,
  DynamicFormProps,
  DynamicFormSubmitHandler,
  transformDynamicFormAttrsIntoSchema as createSchema,
  injectDefaultValuesInDynamicFormAttrs as injectDefaults,
} from '@/components/dynamic-form';
import {
  signinFormAttrs,
  signupFormAttrs,
  refineSignupSchema,
  updateUserFormAttrs,
} from './auth-form.data';
import {
  cn,
  parseAxiosAPIError,
  getUnknownErrorMessage,
  isObject,
} from '@/lib/utils';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { AuthFormProps } from './auth-form.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
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

  const { authData, setAuthData } = useAuthData();

  let formData: {
    props: {
      submitterLabel: DynamicFormProps['submitterLabel'];
      formSchema: DynamicFormProps['formSchema'];
      formAttrs: DynamicFormProps['formAttrs'];
    };
    showToast: (username: string) => void;
    method: 'post' | 'patch';
    endpoint: string;
    name: string;
  };
  if (formType === 'signin') {
    formData = {
      props: {
        submitterLabel: { idle: 'Sign in', submitting: 'Signing in...' },
        formSchema: createSchema(signinFormAttrs),
        formAttrs: signinFormAttrs,
      },
      showToast: (username: string) =>
        toast.success(`Hello, @${username}!`, {
          description: `You have signed in successfully`,
        }),
      endpoint: '/auth/signin',
      method: 'post',
      name: 'user',
    };
  } else if (user) {
    formData = {
      props: {
        formSchema: refineSignupSchema(createSchema(updateUserFormAttrs)),
        submitterLabel: { idle: 'Update', submitting: 'Updating...' },
        formAttrs: injectDefaults(updateUserFormAttrs, user),
      },
      showToast: (username: string) =>
        toast.success(`@${username} updated`, {
          description: 'Your profile is updated successfully',
        }),
      endpoint: `/users/${user.id}`,
      method: 'patch',
      name: user.username,
    };
  } else {
    formData = {
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
      method: 'post',
      name: 'user',
    };
  }

  const handleSubmit: DynamicFormSubmitHandler<
    z.infer<typeof formData.props.formSchema>
  > = async (hookForm, values) => {
    try {
      const { showToast, endpoint, method, name } = formData;
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`;
      const { data } = await axios[method](url, values, { baseURL: '' });
      if (isObject(data) && 'user' in data && 'token' in data) {
        setAuthData({ ...authData, ...data });
      }
      setErrorMessage('');
      hookForm.reset();
      if (onSuccess) onSuccess();
      else router.replace('/');
      showToast(values.username || name);
    } catch (error) {
      setErrorMessage(
        parseAxiosAPIError(error, hookForm).message ||
          getUnknownErrorMessage(error)
      );
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
