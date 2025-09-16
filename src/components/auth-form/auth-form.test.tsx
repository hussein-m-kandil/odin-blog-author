import {
  signinFormAttrs,
  signupFormAttrs,
  updateUserFormAttrs,
} from './auth-form.data';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { injectDefaultValuesInDynamicFormAttrs as injectDefaults } from '@/components/dynamic-form';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AuthFormProps, FormType } from './auth-form.types';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { author, initAuthData } from '@/test-utils';
import { axiosMock } from '@/../__mocks__/axios';

const onSuccess = vi.fn();
const routerMethodMock = vi.fn();
const getInitAuthDataMock = vi.fn(() => initAuthData);

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

const setup = async (props: AuthFormProps) => {
  const data =
    props.formType === 'signin'
      ? {
          submitterOpts: { name: /^sign ?in$/i },
          submittingOpts: { name: /signing ?in/i },
          entries: Object.entries(signinFormAttrs),
        }
      : props.formType === 'update'
      ? {
          submitterOpts: { name: /(update)/i },
          submittingOpts: { name: /updating/i },
          entries: Object.entries(injectDefaults(updateUserFormAttrs, author)),
        }
      : {
          submitterOpts: { name: /^sign ?up$/i },
          submittingOpts: { name: /signing ?up/i },
          entries: Object.entries(signupFormAttrs),
        };
  const user = userEvent.setup();
  return {
    data,
    user,
    ...render(
      <AuthProvider initAuthData={getInitAuthDataMock()}>
        <AuthForm {...props} />
      </AuthProvider>
    ),
  };
};

describe(`<AuthForm />`, () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onAny().reply(200, { user: author, token: 'test-token' });
  });
  afterEach(vi.clearAllMocks);

  for (const formType of ['signin', 'signup'] as FormType[]) {
    const props = { formType };

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

      it('should not submit with empty, required fields', async () => {
        const { data, user } = await setup(props);
        for (const entry of data.entries) {
          const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
          expect(inp.ariaInvalid).toBe('false');
        }
        const submitter = screen.getByRole('button', data.submitterOpts);
        await user.click(submitter);
        for (const entry of data.entries) {
          const { label } = entry[1];
          if (/^!(bio)$/i.test(label)) {
            const inp = screen.getByLabelText(label) as HTMLInputElement;
            expect(inp.ariaInvalid).toBe('true');
          }
        }
      });

      it('should have the given class on the form container', async () => {
        const className = 'test-class';
        const { container } = await setup({ ...props, className });
        expect(container.firstElementChild).toHaveClass(className);
      });

      it('should have a guest sign-in button', async () => {
        await setup(props);
        expect(
          screen.getByRole('button', { name: /sign in .*guest/i })
        ).toHaveAttribute('type', 'button');
      });

      if (formType === 'signin') {
        it('should have a sign-up page link', async () => {
          await setup(props);
          expect(
            screen.getByRole('link', { name: /sign ?up/i })
          ).toHaveAttribute('href', '/signup');
        });
      } else if (formType === 'signup') {
        it('should have a sign-in page link', async () => {
          await setup(props);
          expect(
            screen.getByRole('link', { name: /sign ?in/i })
          ).toHaveAttribute('href', '/signin');
        });
      }
    });
  }

  const updateUserFormProps: AuthFormProps = {
    formType: 'update',
    onSuccess,
  };

  it('should not have a sign-up nor a sign-in page links', async () => {
    await setup(updateUserFormProps);
    expect(screen.queryByRole('link', { name: /sign ?up/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /sign ?in/i })).toBeNull();
  });

  it('should not have a guest sign-in button', async () => {
    await setup(updateUserFormProps);
    expect(
      screen.queryByRole('button', { name: /sign-in .*guest/i })
    ).toBeNull();
  });

  it('should display the given user data in the form', async () => {
    const { data } = await setup(updateUserFormProps);
    for (const entry of data.entries) {
      const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
      expect(inp.value).toStrictEqual(entry[1].defaultValue);
    }
  });

  it('should submit with empty fields if it is an update user form', async () => {
    axiosMock.resetHistory();
    const { data, user } = await setup(updateUserFormProps);
    for (const entry of data.entries) {
      if (['text', 'password', 'textarea'].includes(entry[1].type || '')) {
        user.clear(screen.getByLabelText(entry[1].label));
      }
    }
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(axiosMock.history).toHaveLength(1);
  });

  it('should send `PUT` request on submit, and add the given-user id in the URL', async () => {
    const { data, user } = await setup(updateUserFormProps);
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(axiosMock.history.patch.at(-1)?.url).toMatch(new RegExp(author.id));
  });

  it('should redirect the user and call the given an `onSuccess`', async () => {
    const { data, user } = await setup(updateUserFormProps);
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', data.submittingOpts)
    );
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(routerMethodMock).toHaveBeenCalledOnce();
  });

  it('should throw if `formType` is `update` and could not fin the user data', async () => {
    getInitAuthDataMock.mockImplementationOnce(() => ({
      ...initAuthData,
      token: '',
      user: null,
    }));
    expect(() => setup(updateUserFormProps)).rejects.toThrowError(
      /invalid .*usage/i
    );
  });
});
