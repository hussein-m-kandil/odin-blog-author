import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { postFormAttrs } from './post-form.data';
import { PostForm } from './post-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

const setup = async () => {
  const data = {
    submitterOpts: { name: /(create .*post)|(submit)/i },
    entries: Object.entries(postFormAttrs),
    headingOpts: { name: /create .*post/i },
  };
  const user = userEvent.setup();
  const renderResult = render(<PostForm />);
  return { data, user, ...renderResult };
};

describe(`<PostForm />`, () => {
  it('should have descriptive heading', async () => {
    const { data } = await setup();
    expect(screen.getByRole('heading', data.headingOpts)).toBeInTheDocument();
  });

  it('should render a form with inputs', async () => {
    const { data } = await setup();
    const form = screen.getByRole('form', data.headingOpts);
    expect(form).toBeInTheDocument();
    for (const entry of data.entries) {
      const attrs = entry[1];
      const inp = (
        attrs.type === 'checkbox'
          ? screen.getByRole('checkbox', { name: attrs.label })
          : screen.getByLabelText(attrs.label)
      ) as HTMLInputElement;
      expect(inp).toBeInTheDocument();
      if (attrs.type === 'checkbox')
        expect(inp.ariaChecked).toBe(`${attrs.defaultValue}`);
      else expect(inp.defaultValue).toBe(attrs.defaultValue);
    }
  });

  it('should not submit while all fields are empty', async () => {
    const { data, user } = await setup();
    for (const entry of data.entries) {
      const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
      expect(inp.ariaInvalid).toBe('false');
    }
    const submitter = screen.getByRole('button', data.submitterOpts);
    await user.click(submitter);
    for (const entry of data.entries) {
      if (entry[1].type !== 'checkbox') {
        const inp = screen.getByLabelText(entry[1].label) as HTMLInputElement;
        expect(inp.ariaInvalid).toBe('true');
      }
    }
  });
});
