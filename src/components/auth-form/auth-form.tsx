'use client';

import React from 'react';

import {
  isIssue,
  parseIssues,
  showFieldErrors,
  getErrorMessageOrThrow,
} from '@/lib/utils';
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
import { AuthFormProps } from './auth-form.types';
import { P } from '@/components/typography/p';
import { useRouter } from 'next/navigation';
import { H2 } from '../typography/h2';
import { z } from 'zod';
import Link from 'next/link';
import logger from '@/lib/logger';

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
        if (apiRes.redirected) window.location.href = apiRes.url;
        else router.replace('/');
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
      const defaultMessage = 'An error occurred while signing in';
      logger.error(error?.toString() ?? defaultMessage, error);
      setErrorMessage('Something went wrong, please try again later');
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
    title = 'Sign UP';
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
    <div className='px-4 max-w-md mx-auto mt-5' key={key}>
      <H2 id={titleId} className='text-center mb-5'>
        {title}
      </H2>
      {errorMessage && (
        <P className='text-destructive text-sm text-center mt-0 mb-5'>
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
