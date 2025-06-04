'use client';

import Link from 'next/link';
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
import { AuthFormProps } from './auth-form.types';
import { P } from '@/components/typography/p';
import { useRouter } from 'next/navigation';
import { H2 } from '../typography/h2';
import { z } from 'zod';

export function AuthForm({ formType }: AuthFormProps) {
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();
  const id = React.useId();

  const isSignupForm = formType === 'signup';

  const handleSubmit: DynamicFormSubmitHandler<
    z.infer<typeof signinFormSchema>
  > = async (hookForm, values) => {
    try {
      const endpoint = isSignupForm ? '/users' : '/auth/signin';
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const apiRes = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        method: 'POST',
      });
      if (apiRes.ok) {
        // This block is just a fallback: the API route handler should redirect the user
        hookForm.reset();
        setErrorMessage('');
        if (apiRes.redirected) {
          window.location.href = apiRes.url;
        } else router.replace('/');
      } else {
        setErrorMessage(await getResErrorMessageOrThrow(apiRes, hookForm));
      }
    } catch (error) {
      setErrorMessage(getUnknownErrorMessage(error));
    }
  };

  const titleId = `${id}-title`;
  const toggleQuestionSuffix = 'have an account?';
  const commonFormProps: Partial<DynamicFormProps> = {
    'aria-labelledby': titleId,
    submitterClassName: 'w-full',
  };

  let key, title, authFormJSX, togglerHref, togglerText, toggleQuestion;
  if (isSignupForm) {
    toggleQuestion = `Already ${toggleQuestionSuffix}`;
    togglerHref = '/signin';
    togglerText = 'Sign in';
    key = `${id}-signup`;
    title = 'Sign Up';
    authFormJSX = (
      <DynamicForm
        {...commonFormProps}
        formSchema={signupFormSchema}
        formAttrs={signupFormAttrs}
        onSubmit={handleSubmit}
        submitterLabel={{ idle: 'Sign up', submitting: 'Signing up' }}
      />
    );
  } else {
    toggleQuestion = `Don't ${toggleQuestionSuffix}`;
    togglerHref = '/signup';
    togglerText = 'Sign up';
    key = `${id}-signin`;
    title = 'Sign In';
    authFormJSX = (
      <DynamicForm
        {...commonFormProps}
        formSchema={signinFormSchema}
        formAttrs={signinFormAttrs}
        onSubmit={handleSubmit}
        submitterLabel={{ idle: 'Sign in', submitting: 'Signing in' }}
      />
    );
  }

  return (
    <div className='px-4 max-w-md mx-auto mt-6' key={key}>
      <H2 id={titleId} className='font-normal text-2xl text-center mb-6'>
        {title}
      </H2>
      {errorMessage && (
        <P className='text-destructive text-sm text-center mt-0 mb-6'>
          {errorMessage}
        </P>
      )}
      {authFormJSX}
      <P className='text-center'>
        {toggleQuestion}{' '}
        <Link href={togglerHref} className='p-0'>
          {togglerText}
        </Link>
      </P>
    </div>
  );
}

export default AuthForm;
