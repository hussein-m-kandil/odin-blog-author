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
import { cn, parseAxiosAPIError, getUnknownErrorMessage } from '@/lib/utils';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { AuthFormProps } from './auth-form.types';
import { useRouter } from 'next/navigation';
import { AxiosRequestConfig } from 'axios';
import { AuthResData } from '@/types';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';

export function AuthForm({
  formLabelId,
  className,
  formType,
  user,
  onSuccess,
}: AuthFormProps) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const { authData, signin } = useAuthData();
  const { authUrl, authAxios } = authData;

  let formData: {
    props: {
      submitterLabel: DynamicFormProps['submitterLabel'];
      formSchema: DynamicFormProps['formSchema'];
      formAttrs: DynamicFormProps['formAttrs'];
    };
    showToast: (username: string) => void;
    reqConfig: AxiosRequestConfig;
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
      reqConfig: { url: `${authUrl}/signin`, method: 'post', baseURL: '' },
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
      reqConfig: { url: `/users/${user.id}`, method: 'patch' },
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
      reqConfig: { url: `${authUrl}/signup`, method: 'post', baseURL: '' },
    };
  }

  const handleSubmit: DynamicFormSubmitHandler<
    z.infer<typeof formData.props.formSchema>
  > = async (hookForm, values) => {
    try {
      formData.reqConfig.data = values;
      const { data } = await authAxios<AuthResData>(formData.reqConfig);
      setErrorMessage('');
      hookForm.reset();
      signin(data);
      if (onSuccess) onSuccess();
      else router.replace('/');
      formData.showToast(values.username || user?.username || 'user');
    } catch (error) {
      setErrorMessage(
        parseAxiosAPIError(error, hookForm).message ||
          getUnknownErrorMessage(error)
      );
    }
  };

  const signInAsGuest = async () => {
    try {
      const { data } = await authAxios<AuthResData>({
        url: `${authUrl}/guest`,
        method: 'post',
        baseURL: '',
      });
      setErrorMessage('');
      signin(data);
      if (onSuccess) onSuccess();
      else router.replace('/');
      toast.success(`Hello, Guest!`, {
        description: `You have signed in as a guest successfully`,
      });
    } catch (error) {
      setErrorMessage(
        parseAxiosAPIError(error).message || getUnknownErrorMessage(error)
      );
    }
  };

  return (
    <div className={cn('px-4 max-w-md mx-auto mt-6 space-y-4', className)}>
      {!user && (
        <div className='text-center flex justify-center *:grow'>
          <Button type='button' onClick={signInAsGuest}>
            Sign-in as a guest!
          </Button>
        </div>
      )}
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
