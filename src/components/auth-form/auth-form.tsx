'use client';

import React from 'react';

import {
  DynamicForm,
  DynamicFormProps,
  DynamicFormSubmitHandler,
} from '@/components/dynamic-form';
import {
  signinFormAttrs,
  signinFormSchema,
  signupFormAttrs,
  signupFormSchema,
} from './auth-form.data';
import { P } from '@/components/typography/p';
import { H2 } from '../typography/h2';
import { Button } from '../ui/button';
import { z } from 'zod';

export function AuthForm() {
  const [isSignin, setIsSignin] = React.useState(true);

  const id = React.useId();

  const handleSignin: DynamicFormSubmitHandler<
    z.infer<typeof signinFormSchema>
  > = async (hookForm, values) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    if (values.username === 'xyz') {
      hookForm.setError('username', {
        type: 'manual',
        message: 'Invalid username or password',
      });
    } else {
      hookForm.reset();
    }
    console.log(values);
  };

  const handleSignup = handleSignin;

  const titleId = `${id}-title`;
  const toggleQuestionSuffix = 'have an account?';
  const commonFormProps: Partial<DynamicFormProps> = {
    className: 'my-7',
    'aria-labelledby': titleId,
    submitterClassName: 'w-full',
  };

  let key, title, authFormJSX, togglerText, toggleQuestion;

  if (isSignin) {
    toggleQuestion = `Don't ${toggleQuestionSuffix}`;
    togglerText = 'Sign up';
    key = `${id}-signin`;
    title = 'Sign In';
    authFormJSX = (
      <DynamicForm
        {...commonFormProps}
        formSchema={signinFormSchema}
        formAttrs={signinFormAttrs}
        onSubmit={handleSignin}
        submitterLabel={{ idle: 'Sign in', submitting: 'Signing in' }}
      />
    );
  } else {
    toggleQuestion = `Already ${toggleQuestionSuffix}`;
    togglerText = 'Sign in';
    key = `${id}-signup`;
    title = 'Sign UP';
    authFormJSX = (
      <DynamicForm
        {...commonFormProps}
        formSchema={signupFormSchema}
        formAttrs={signupFormAttrs}
        onSubmit={handleSignup}
        submitterLabel={{ idle: 'Sign up', submitting: 'Signing up' }}
      />
    );
  }

  return (
    <div className='px-4 max-w-xl mx-auto' key={key}>
      <H2 id={titleId}>{title}</H2>
      {authFormJSX}
      <P className='text-center'>
        {toggleQuestion}{' '}
        <Button
          type='button'
          variant='link'
          className='p-0'
          onClick={() => setIsSignin(!isSignin)}>
          {togglerText}
        </Button>
      </P>
    </div>
  );
}

export default AuthForm;
