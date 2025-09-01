'use client';

import React from 'react';
import Link from 'next/link';
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
import { LogIn, UserPen, UserPlus, UserCheck } from 'lucide-react';
import { CloseButton } from '@/components/close-button';
import { useAuthData } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';
import { AuthFormProps } from './auth-form.types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AxiosRequestConfig } from 'axios';
import { AuthResData } from '@/types';
import { toast } from 'sonner';
import { z } from 'zod';

export function AuthForm({
  className,
  formType,
  onSuccess,
  onClose,
}: AuthFormProps) {
  const router = useRouter();

  const {
    authData: { authAxios, authUrl, user },
    signout,
    signin,
  } = useAuthData();

  let formData: {
    props: {
      submitterLabel: DynamicFormProps['submitterLabel'];
      submitterIcon: DynamicFormProps['submitterIcon'];
      formSchema: DynamicFormProps['formSchema'];
      formAttrs: DynamicFormProps['formAttrs'];
    };
    reqConfig: AxiosRequestConfig;
  };
  if (formType === 'signin') {
    formData = {
      props: {
        submitterLabel: { idle: 'Sign in', submitting: 'Signing in...' },
        formSchema: createSchema(signinFormAttrs),
        formAttrs: signinFormAttrs,
        submitterIcon: <LogIn />,
      },
      reqConfig: { url: `${authUrl}/signin`, method: 'post', baseURL: '' },
    };
  } else if (formType === 'signup') {
    formData = {
      props: {
        submitterLabel: { idle: 'Sign up', submitting: 'Signing up...' },
        formSchema: refineSignupSchema(createSchema(signupFormAttrs)),
        formAttrs: signupFormAttrs,
        submitterIcon: <UserPlus />,
      },
      reqConfig: { url: `${authUrl}/signup`, method: 'post', baseURL: '' },
    };
  } else if (formType === 'update' && user) {
    formData = {
      props: {
        formSchema: refineSignupSchema(createSchema(updateUserFormAttrs)),
        submitterLabel: { idle: 'Update', submitting: 'Updating...' },
        formAttrs: injectDefaults(updateUserFormAttrs, user),
        submitterIcon: <UserPen />,
      },
      reqConfig: { url: `/users/${user.id}`, method: 'patch' },
    };
  } else {
    signout();
    throw Error('Invalid `AuthForm` usage');
  }

  const handleSuccess = (data: AuthResData) => {
    signin(data);
    onSuccess?.();
    router.replace(
      formType === 'update' && data.user
        ? `/profile/${data.user.username}`
        : '/'
    );
  };

  const handleSubmit: DynamicFormSubmitHandler<
    z.infer<typeof formData.props.formSchema>
  > = async (hookForm, values) => {
    try {
      formData.reqConfig.data = values;
      const { data } = await authAxios<AuthResData>(formData.reqConfig);
      hookForm.reset();
      handleSuccess(data);
      if (formType === 'update') {
        toast.success('Profile updated', {
          description: `You have updated your profile successfully`,
        });
      } else {
        toast.success(`Hello, @${data.user.username}!`, {
          description: `You have signed up successfully`,
        });
      }
    } catch (error) {
      toast.error(
        parseAxiosAPIError(error, hookForm).message ||
          getUnknownErrorMessage(error)
      );
    }
  };

  const signInGuest = async () => {
    try {
      const { data } = await authAxios<AuthResData>({
        url: `${authUrl}/guest`,
        method: 'post',
        baseURL: '',
      });
      handleSuccess(data);
      toast.success(`Hello, @${data.user.username}!`, {
        description: 'You have signed in as guest successfully',
      });
    } catch (error) {
      toast.error(
        parseAxiosAPIError(error).message || getUnknownErrorMessage(error)
      );
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto mt-4 space-y-4', className)}>
      <DynamicForm
        aria-label={`${formType}${formType === 'update' ? ' user' : ''} form`}
        submitterClassName='w-full'
        onSubmit={handleSubmit}
        {...formData.props}
      />
      {formType !== 'update' && (
        <div className='text-center space-y-2 *:flex *:w-full'>
          <div className='my-6 *:shrink-1 *:grow-1 items-center gap-2'>
            <Separator />
            <span>or</span>
            <Separator />
          </div>
          <Button type='button' variant='outline' asChild>
            {formType === 'signin' ? (
              <Link href='/signup' className='p-0'>
                <UserPlus /> Sign up
              </Link>
            ) : (
              <Link href='/signin' className='p-0'>
                <LogIn /> Sign in
              </Link>
            )}
          </Button>
          <Button type='button' variant='outline' onClick={signInGuest}>
            <UserCheck /> Sign in as guest
          </Button>
        </div>
      )}
      <CloseButton onClose={onClose} />
    </div>
  );
}

export default AuthForm;
