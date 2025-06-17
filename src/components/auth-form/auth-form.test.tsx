import { signinFormAttrs, signupFormAttrs } from './auth-form.data';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FormType } from './auth-form.types';
import { AuthForm } from './auth-form';

const setup = async (formType: FormType) => {
  const data =
    formType === 'signup'
      ? {
          submitterOpts: { name: /(sign ?up)|(submit)/i },
          entries: Object.entries(signupFormAttrs),
          formLabelId: 'signup',
        }
      : {
          submitterOpts: { name: /(sign ?in)|(submit)/i },
          entries: Object.entries(signinFormAttrs),
          formLabelId: 'signin',
        };
  const user = userEvent.setup();
  const renderResult = render(
    <AuthForm formType={formType} formLabelId={data.formLabelId} />
  );
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
});
