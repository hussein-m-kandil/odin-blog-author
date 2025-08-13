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
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { ImageForm } from '@/components/image-form';
import { AuthFormProps } from './auth-form.types';
import { Button } from '@/components/ui/button';
import { AuthResData, Image } from '@/types';
import { useRouter } from 'next/navigation';
import { AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { z } from 'zod';

export function AuthForm({ className, formType, onSuccess }: AuthFormProps) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const {
    authData: { authAxios, authUrl, user },
    signout,
    signin,
  } = useAuthData();

  const [image, setImage] = React.useState<Image | null>(user?.avatar || null);

  let formData: {
    props: {
      submitterLabel: DynamicFormProps['submitterLabel'];
      submitterIcon: DynamicFormProps['submitterIcon'];
      formSchema: DynamicFormProps['formSchema'];
      formAttrs: DynamicFormProps['formAttrs'];
    };
    reqConfig: AxiosRequestConfig;
    redirectUrl: string;
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
      redirectUrl: '/',
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
      redirectUrl: '/',
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
      redirectUrl: '/profile',
    };
  } else {
    signout();
    throw Error('Invalid `AuthForm` usage');
  }

  const handleSuccess = (data: AuthResData, redirectUrl: string) => {
    setErrorMessage('');
    signin(data);
    onSuccess?.();
    router.replace(redirectUrl);
  };

  const handleSubmit: DynamicFormSubmitHandler<
    z.infer<typeof formData.props.formSchema>
  > = async (hookForm, values) => {
    try {
      formData.reqConfig.data = image
        ? { ...values, avatar: image.id }
        : values;
      const { data } = await authAxios<AuthResData>(formData.reqConfig);
      hookForm.reset();
      handleSuccess(data, formData.redirectUrl);
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
      setErrorMessage(
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
      handleSuccess(data, '/');
      toast.success(`Hello, @${data.user.username}!`, {
        description: 'You have signed in as guest successfully',
      });
    } catch (error) {
      setErrorMessage(
        parseAxiosAPIError(error).message || getUnknownErrorMessage(error)
      );
    }
  };

  return (
    <div className={cn('px-4 max-w-md mx-auto mt-6', className)}>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      {formType === 'update' && (
        <ImageForm image={image} onSuccess={(img) => setImage(img)} />
      )}
      <DynamicForm
        aria-label={`${formType}${formType === 'update' ? ' user' : ''} form`}
        submitterClassName='w-full'
        onSubmit={handleSubmit}
        {...formData.props}
      />
      {formType !== 'update' && (
        <div className='text-center space-y-2 *:flex *:w-full pt-6 mt-6 border-t border-muted'>
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
    </div>
  );
}

export default AuthForm;
