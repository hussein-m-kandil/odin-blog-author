import {
  DynamicFormAttrs,
  DynamicFormSubmitHandler,
} from './dynamic-form.types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DynamicForm } from './dynamic-form';
import { z } from 'zod';

describe('<DynamicForm />', () => {
  const formAttrs: DynamicFormAttrs = {
    username: {
      defaultValue: '',
      label: 'Username',
      placeholder: 'nowhere_man',
      description: 'Could be anything unique (e.g. an email)',
      schema: z.string().min(3, { message: 'Username must have 3 characters' }),
    },
    password: {
      defaultValue: '',
      type: 'password',
      label: 'Password',
      schema: z.string().min(8, { message: 'Password must have 8 characters' }),
    },
    bio: {
      defaultValue: '',
      type: 'textarea',
      label: 'Bio',
      schema: z.string().optional(),
    },
    public: {
      type: 'checkbox',
      defaultValue: false,
      label: 'Public Profile',
      placeholder: '',
      schema: z.boolean(),
    },
  };

  const username = formAttrs.username.label;
  const password = formAttrs.password.label;
  const bio = formAttrs.bio.label;

  const formSchema = z.object(
    Object.fromEntries(
      Object.entries(formAttrs).map(([name, attrs]) => [name, attrs.schema])
    )
  );

  const DELAY_MS = 50;

  const handleSubmit: DynamicFormSubmitHandler<
    z.infer<typeof formSchema>
  > = () => {
    return new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  };

  const onSubmit = vi.fn(handleSubmit);

  afterEach(vi.clearAllMocks);

  const getSubmitBtn = (label = 'submit') => {
    return screen.getByRole('button', {
      name: new RegExp(label, 'i'),
    }) as HTMLButtonElement;
  };

  const findSubmittingBtn = async (label = 'submit') => {
    return (await screen.findByRole('button', {
      name: new RegExp(`${label}(?!ting)`, 'i'),
    })) as HTMLButtonElement;
  };

  it('should have the given `topChildren` as the first child', () => {
    const topChildren = <div>Hi!</div>;
    render(
      <DynamicForm
        {...{ formSchema, formAttrs, onSubmit, topChildren }}
        aria-label='Signin Form'
      />
    );
    expect(screen.getByRole('form').firstElementChild).toHaveTextContent('Hi!');
  });

  it('should have the given `children` before the submit button', () => {
    render(
      <DynamicForm
        {...{ formSchema, formAttrs, onSubmit }}
        aria-label='Signin Form'>
        <div>Hi!</div>
      </DynamicForm>
    );
    expect(
      Array.from(screen.getByRole('form').children).at(-2)
    ).toHaveTextContent('Hi!');
  });

  it('should have the given fields with their attributes', () => {
    render(
      <DynamicForm
        {...{ formSchema, formAttrs, onSubmit }}
        aria-label='Signin Form'
      />
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    const submitter = getSubmitBtn();
    const usernameInp = screen.getByLabelText(username) as HTMLInputElement;
    const passwordInp = screen.getByLabelText(password) as HTMLInputElement;
    const bioInp = screen.getByLabelText(bio) as HTMLTextAreaElement;
    const publicInp = screen.getByRole('checkbox') as HTMLInputElement;
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('noValidate');
    expect(Array.from(new FormData(form))).toHaveLength(3);
    expect(submitter.type).toBe('submit');
    expect(usernameInp.type).toBe('text');
    expect(passwordInp.type).toBe('password');
    expect(bioInp).toBeInstanceOf(HTMLTextAreaElement);
    expect(bioInp.defaultValue).toBe(formAttrs.bio.defaultValue);
    expect(publicInp.ariaChecked).toBe(`${formAttrs.public.defaultValue}`);
    expect(usernameInp.defaultValue).toBe(formAttrs.username.defaultValue);
    expect(passwordInp.defaultValue).toBe(formAttrs.password.defaultValue);
    expect(usernameInp.placeholder).toBe(formAttrs.username.placeholder ?? '');
    expect(passwordInp.placeholder).toBe(formAttrs.password.placeholder ?? '');
    expect(bioInp.placeholder).toBe(formAttrs.bio.placeholder ?? '');
    expect(screen.getByText(formAttrs.username.description ?? ''));
  });

  it('should all fields be disabled', () => {
    render(
      <DynamicForm
        {...{ formSchema, formAttrs, onSubmit }}
        aria-label='Signin Form'
        isDisabled={true}
      />
    );
    expect(getSubmitBtn()).toBeDisabled();
    expect(screen.getByLabelText(username)).toBeDisabled();
    expect(screen.getByLabelText(password)).toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByLabelText(bio)).toBeDisabled();
  });

  it('should have the given submitter: label, className, and icon', async () => {
    const submitterLabel = { idle: 'Sign in', submitting: 'Signing in' };
    const submitterClassName = 'blah';
    const submitterIcon = 'sub-icon';
    const user = userEvent.setup();
    render(
      <DynamicForm
        {...{
          formSchema,
          formAttrs,
          onSubmit,
          submitterIcon,
          submitterLabel,
          submitterClassName,
        }}
        aria-label='Signin Form'
      />
    );
    const usernameInp = screen.getByLabelText(username) as HTMLInputElement;
    const passwordInp = screen.getByLabelText(password) as HTMLInputElement;
    const submitter = getSubmitBtn(submitterLabel.idle);
    expect(submitter).toHaveTextContent(submitterIcon + submitterLabel.idle);
    expect(submitter).toHaveClass(submitterClassName);
    await user.type(passwordInp, '12345678');
    await user.type(usernameInp, 'xyz');
    await user.click(submitter);
    expect(submitter).toHaveTextContent(submitterLabel.submitting);
  });

  it('should validate and submit as expected', async () => {
    const user = userEvent.setup();
    render(
      <DynamicForm
        {...{ formSchema, formAttrs, onSubmit }}
        aria-label='Signin Form'
      />
    );
    const submitter = getSubmitBtn();
    const usernameInp = screen.getByLabelText(username) as HTMLInputElement;
    const passwordInp = screen.getByLabelText(password) as HTMLInputElement;
    const publicInp = screen.getByRole('checkbox') as HTMLInputElement;
    await user.type(usernameInp, 'xy');
    await user.type(passwordInp, '1234567');
    await user.click(publicInp);
    await user.click(submitter);
    expect(onSubmit).not.toBeCalled();
    expect(screen.getByText(/3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/8 characters/i)).toBeInTheDocument();
    await user.type(usernameInp, 'z');
    await user.type(passwordInp, '8');
    expect(screen.queryByText(/3 characters/i)).toBeNull();
    expect(screen.queryByText(/8 characters/i)).toBeNull();
    await user.click(submitter);
    expect(await findSubmittingBtn()).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]).toContainEqual({
      password: '12345678',
      username: 'xyz',
      public: true,
      bio: '',
    });
    expect(await findSubmittingBtn()).toBeInTheDocument();
    expect(screen.queryByText(/3 characters/i)).toBeNull();
    expect(screen.queryByText(/8 characters/i)).toBeNull();
  });

  it('should pass the `hookForm` to the submit handler to e.g. set an input error if needed', async () => {
    const invalidUsername = 'xyz';
    const validUsername = 'abc';
    const serverError = { type: 'manual', message: 'Username already exists' };
    const opts = { shouldFocus: true };
    onSubmit.mockImplementation((hookForm, values) => {
      return new Promise((resolve) =>
        setTimeout(() => {
          if (values.username === invalidUsername) {
            hookForm.setError('username', serverError, opts);
          }
          resolve(null);
        }, DELAY_MS)
      );
    });
    const user = userEvent.setup();
    render(
      <DynamicForm
        {...{ formSchema, formAttrs, onSubmit }}
        aria-label='Signin Form'
      />
    );
    const submitter = getSubmitBtn();
    const usernameInp = screen.getByLabelText(username) as HTMLInputElement;
    const passwordInp = screen.getByLabelText(password) as HTMLInputElement;
    await user.type(usernameInp, invalidUsername);
    await user.type(passwordInp, '12345678');
    await user.click(submitter);
    expect(await findSubmittingBtn()).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(await findSubmittingBtn()).toBeInTheDocument();
    expect(screen.getByText(serverError.message)).toBeInTheDocument();
    await user.type(usernameInp, validUsername);
    await user.click(submitter);
    expect(await findSubmittingBtn()).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(await findSubmittingBtn()).toBeInTheDocument();
    expect(screen.queryByText(serverError.message)).toBeNull();
  });

  it('should pass the `hookForm` to the submit handler to e.g. reset the form if needed', async () => {
    onSubmit.mockImplementation((hookForm) => {
      return new Promise((resolve) =>
        setTimeout(() => resolve(hookForm.reset()), DELAY_MS)
      );
    });
    const user = userEvent.setup();
    render(
      <DynamicForm
        {...{ formSchema, formAttrs, onSubmit }}
        aria-label='Signin Form'
      />
    );
    const submitter = getSubmitBtn();
    const usernameInp = screen.getByLabelText(username) as HTMLInputElement;
    const passwordInp = screen.getByLabelText(password) as HTMLInputElement;
    await user.type(usernameInp, 'xyz');
    await user.type(passwordInp, '12345678');
    await user.click(submitter);
    expect(await findSubmittingBtn()).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(await findSubmittingBtn()).toBeInTheDocument();
    expect(usernameInp).toHaveValue('');
    expect(passwordInp).toHaveValue('');
  });
});
