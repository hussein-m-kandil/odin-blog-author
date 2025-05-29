import { signinFormAttrs, signupFormAttrs } from './auth-form.data';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormType } from './auth-form.types';
import { AuthForm } from './auth-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

const setup = async (formType: FormType) => {
  const data =
    formType === 'signup'
      ? {
          submitterOpts: { name: /(sign ?up)|(submit)/i },
          entries: Object.entries(signupFormAttrs),
          headingOpts: { name: /sign ?up/i },
        }
      : {
          submitterOpts: { name: /(sign ?in)|(submit)/i },
          entries: Object.entries(signinFormAttrs),
          headingOpts: { name: /sign ?in/i },
        };
  const user = userEvent.setup();
  const renderResult = render(<AuthForm formType={formType} />);
  return { data, user, ...renderResult };
};

const assertHeadingExists = async (formType: FormType) => {
  const { data } = await setup(formType);
  expect(screen.getByRole('heading', data.headingOpts)).toBeInTheDocument();
};

const assertFormAndInputExists = async (formType: FormType) => {
  const { data } = await setup(formType);
  const form = screen.getByRole('form', data.headingOpts);
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
      it('should have descriptive heading', async () => {
        await assertHeadingExists(formType);
      });

      it('should render a form with inputs', async () => {
        await assertFormAndInputExists(formType);
      });

      it('should not submit with empty fields', async () => {
        await assertNotSubmitWithEmptyFields(formType);
      });
    });
  }
});
