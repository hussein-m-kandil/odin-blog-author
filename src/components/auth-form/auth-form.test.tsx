import { signinFormAttrs, signupFormAttrs } from './auth-form.data';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AuthForm } from './auth-form';

type TestType = 'signin' | 'signup';

const setup = async (testType: TestType) => {
  let data;
  const user = userEvent.setup();
  const renderResult = render(<AuthForm />);
  if (testType === 'signup') {
    await user.click(screen.getByRole('button', { name: /sign ?up/i }));
    data = {
      submitterOpts: { name: /(sign ?up)|(submit)/i },
      entries: Object.entries(signupFormAttrs),
      headingOpts: { name: /sign ?up/i },
    };
  } else {
    data = {
      submitterOpts: { name: /(sign ?in)|(submit)/i },
      entries: Object.entries(signinFormAttrs),
      headingOpts: { name: /sign ?in/i },
    };
  }
  return { user, data, ...renderResult };
};

const assertHeadingExists = async (testType: TestType) => {
  const { data } = await setup(testType);
  expect(screen.getByRole('heading', data.headingOpts)).toBeInTheDocument();
};

const assertFormAndInputExists = async (testType: TestType) => {
  const { data } = await setup(testType);
  const form = screen.getByRole('form', data.headingOpts);
  expect(form).toBeInTheDocument();
  for (const [inpName, attrs] of data.entries) {
    const inp = screen.getByLabelText(attrs.label) as HTMLInputElement;
    expect(inp).toBeInTheDocument();
    expect(inp.name).toBe(inpName);
    expect(inp.defaultValue).toBe(attrs.defaultValue);
  }
};

const assertNotSubmitWithEmptyFields = async (testType: TestType) => {
  const { data, user } = await setup(testType);
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
  for (const testType of ['signin', 'signup'] as TestType[]) {
    describe(testType, () => {
      it('should have descriptive heading', async () => {
        await assertHeadingExists(testType);
      });

      it('should render a form with inputs', async () => {
        await assertFormAndInputExists(testType);
      });

      it('should not submit with empty fields', async () => {
        await assertNotSubmitWithEmptyFields(testType);
      });
    });
  }
});
