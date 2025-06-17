import { injectDefaultValuesInDynamicFormAttrs as injectDefaults } from '@/components/dynamic-form';
import {
  signinFormAttrs,
  signupFormAttrs,
  updateUserFormAttrs,
} from './auth-form.data';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { author, delay } from '@/test-utils';
import { FormType } from './auth-form.types';
import { AuthForm } from './auth-form';

const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation(() => {
  return new Promise((resolve) =>
    delay(() => resolve(new Response(null, { status: 204 })))
  );
});

afterEach(vi.clearAllMocks);

const setup = async (formType: FormType, userUpdate = false) => {
  const formLabelId = formType;
  const data =
    formType === 'signin'
      ? {
          submitterOpts: { name: /(sign ?in)/i },
          entries: Object.entries(signinFormAttrs),
        }
      : userUpdate
      ? {
          submitterOpts: { name: /(update)/i },
          entries: Object.entries(injectDefaults(updateUserFormAttrs, author)),
        }
      : {
          submitterOpts: { name: /(sign ?up)/i },
          entries: Object.entries(signupFormAttrs),
        };
  const props = userUpdate
    ? { formType, formLabelId, user: author }
    : { formType, formLabelId };
  const user = userEvent.setup();
  const renderResult = render(<AuthForm {...props} />);
  return { data, user, ...renderResult };
};

const assertFormAndInputExists = async (formType: FormType) => {
  const { data } = await setup(formType);
  const form = screen.getByRole('form');
  expect(form).toBeInTheDocument();
  for (const [inpName, attrs] of data.entries) {
    const inp = screen.getByLabelText(attrs.label) as HTMLInputElement;
    expect(inp).toBeInTheDocument();
    expect(inp.name).toBe(inpName);
    expect(inp.defaultValue).toBe(attrs.defaultValue);
  }
};

const assertNotSubmitWithEmptyFields = async (formType: FormType) => {
  const { data, user } = await setup(formType);
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
};

describe(`<AuthForm />`, () => {
  for (const formType of ['signin', 'signup'] as FormType[]) {
    describe(formType, () => {
      it('should render a form with inputs', async () => {
        await assertFormAndInputExists(formType);
      });

      it('should not submit with empty fields', async () => {
        await assertNotSubmitWithEmptyFields(formType);
      });
    });
  }

  it('should display the given user data in the form', async () => {
    const { data } = await setup('signup', true);
    for (const entry of data.entries) {
      const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
      expect(inp.value).toStrictEqual(entry[1].defaultValue);
    }
  });

  it('should submit with empty fields if it is an update user form', async () => {
    const { data, user } = await setup('signup', true);
    for (const entry of data.entries) {
      if (['text', 'password', 'textarea'].includes(entry[1].type || '')) {
        user.clear(screen.getByLabelText(entry[1].label));
      }
    }
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());
  });

  it('should send `PUT` request on submit, and add the given-user id in the URL', async () => {
    const { data, user } = await setup('signup', true);
    await user.click(screen.getByRole('button', data.submitterOpts));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());
    const reqInit = fetchSpy.mock.calls[0][1] as RequestInit;
    const submitUrl = fetchSpy.mock.calls[0][0] as string;
    expect(submitUrl).toMatch(new RegExp(author.id));
    expect(reqInit.method).toBe('PUT');
  });
});
