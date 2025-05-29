import { DynamicFormAttrs } from '@/components/dynamic-form';
import { z } from 'zod';

export const signinFormAttrs: DynamicFormAttrs = {
  username: {
    type: 'text',
    defaultValue: '',
    label: 'Username',
    placeholder: 'nowhere_man',
    schema: z.string().trim().min(1, { message: 'Username is required' }),
  },
  password: {
    type: 'password',
    defaultValue: '',
    label: 'Password',
    placeholder: '********',
    schema: z.string().trim().min(1, { message: 'Password is required' }),
  },
};

export const signinFormSchema = z.object(
  Object.fromEntries(
    Object.entries(signinFormAttrs).map(([name, attrs]) => [name, attrs.schema])
  )
);

export const signupFormAttrs: DynamicFormAttrs = {
  username: {
    type: 'text',
    defaultValue: '',
    label: 'Username',
    placeholder: 'nowhere_man',
    schema: z.string().trim().min(3, {
      message: 'Username must be at least 3 characters.',
    }),
  },
  password: {
    type: 'password',
    defaultValue: '',
    label: 'Password',
    placeholder: '********',
    schema: z
      .string()
      .trim()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        `Password must contain a number, a special character a lowercase letter, and an uppercase letter`
      ),
  },
  confirm: {
    type: 'password',
    defaultValue: '',
    label: 'Password Confirmation',
    placeholder: '********',
    schema: z
      .string()
      .trim()
      .min(1, { message: 'Password confirmation is required' }),
  },
  fullname: {
    type: 'text',
    defaultValue: '',
    label: 'Full Name',
    placeholder: 'Nowhere Man',
    schema: z.string().trim().min(3, {
      message: 'Full name must be at least 3 characters.',
    }),
  },
};

export const signupFormSchema = z
  .object(
    Object.fromEntries(
      Object.entries(signupFormAttrs).map(([name, attrs]) => [
        name,
        attrs.schema,
      ])
    )
  )
  .refine(({ password, confirm }) => password === confirm, {
    message: 'Passwords does not match',
    path: ['confirm'],
  });
