import {
  signinFormAttrs,
  signupFormAttrs,
  updateUserFormAttrs,
} from './auth-form.data';
import { injectDefaultValuesInDynamicFormAttrs as injectDefaults } from '@/components/dynamic-form';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthFormProps, FormType } from './auth-form.types';
import { userEvent } from '@testing-library/user-event';
import { author, delay } from '@/test-utils';

const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(
  vi.fn(() => {
    return new Promise<Response>((resolve) =>
      delay(() => resolve(new Response(null, { status: 204 })))
    );
  })
);

const onSuccess = vi.fn();
const routerMethodMock = vi.fn();

vi.unmock('next/navigation'); // This will be hoisted to unmock the test setup mock

vi.doMock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({
    prefetch: routerMethodMock,
    replace: routerMethodMock,
    back: routerMethodMock,
    push: routerMethodMock,
  }),
}));

const { AuthForm } = await import('./auth-form');

afterEach(vi.clearAllMocks);
afterAll(() => vi.doUnmock('next/navigation'));

const setup = async (props: AuthFormProps) => {
  const data =
    props.formType === 'signin'
      ? {
          submitterOpts: { name: /(sign ?in)/i },
          entries: Object.entries(signinFormAttrs),
        }
      : props.user
      ? {
          submitterOpts: { name: /(update)/i },
          entries: Object.entries(injectDefaults(updateUserFormAttrs, author)),
        }
      : {
          submitterOpts: { name: /(sign ?up)/i },
          entries: Object.entries(signupFormAttrs),
        };
  const user = userEvent.setup();
  return { data, user, ...render(<AuthForm {...props} />) };
};

describe(`<AuthForm />`, () => {
  for (const formType of ['signin', 'signup'] as FormType[]) {
    const props = { formType, formLabelId: `test-${formType}-form` };

    describe(formType, () => {
      it('should render a form with inputs', async () => {
        const { data } = await setup(props);
        const form = screen.getByRole('form');
        expect(form).toBeInTheDocument();
        for (const [inpName, attrs] of data.entries) {
          const inp = screen.getByLabelText(attrs.label) as HTMLInputElement;
          expect(inp).toBeInTheDocument();
          expect(inp.name).toBe(inpName);
          expect(inp.defaultValue).toBe(attrs.defaultValue);
        }
      });

      it('should not submit with empty fields', async () => {
        const { data, user } = await setup(props);
        for (const entry of data.entries) {
          const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
          expect(inp.ariaInvalid).toBe('false');
        }
        const submitter = screen.getByRole('button', data.submitterOpts);
        await user.click(submitter);
        for (const entry of data.entries) {
          const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
          expect(inp.ariaInvalid).toBe('true');
        }
      });

      it('should have the given class on the form container', async () => {
        const className = 'test-class';
        const { container } = await setup({ ...props, className });
        expect(container.firstElementChild).toHaveClass(className);
      });
    });
  }

  const updateUserFormProps: AuthFormProps = {
    formLabelId: 'test-update-user-form',
    formType: 'signup',
    user: author,
    onSuccess,
  };

  it('should display the given user data in the form', async () => {
    const { data } = await setup(updateUserFormProps);
    for (const entry of data.entries) {
      const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
      expect(inp.value).toStrictEqual(entry[1].defaultValue);
    }
  });

  it('should submit with empty fields if it is an update user form', async () => {
    const { data, user } = await setup(updateUserFormProps);
    for (const entry of data.entries) {
      if (['text', 'password', 'textarea'].includes(entry[1].type || '')) {
        user.clear(screen.getByLabelText(entry[1].label));
      }
    }
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  });

  it('should send `PUT` request on submit, and add the given-user id in the URL', async () => {
    const { data, user } = await setup(updateUserFormProps);
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const reqInit = fetchMock.mock.calls[0][1] as RequestInit;
    const submitUrl = fetchMock.mock.calls[0][0] as string;
    expect(submitUrl).toMatch(new RegExp(author.id));
    expect(reqInit.method).toBe('PATCH');
  });

  it('should call the given `onSuccess` and not redirect the user', async () => {
    const { data, user } = await setup(updateUserFormProps);
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(routerMethodMock).not.toHaveBeenCalled();
  });

  it('should redirect the user if not given an `onSuccess`', async () => {
    const { data, user } = await setup({
      ...updateUserFormProps,
      onSuccess: undefined,
    });
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitFor(() => expect(routerMethodMock).toHaveBeenCalledOnce());
    expect(routerMethodMock).toHaveBeenCalledOnce();
  });
});
