import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DeleteForm } from './delete-form';

describe('<DeleteForm />', () => {
  const onDelete = vi.fn();
  const onCancel = vi.fn();
  const subject = 'Delete Test';
  const name = new RegExp(subject);
  const props: React.ComponentProps<typeof DeleteForm> = {
    subject,
    onCancel,
    onDelete,
  };

  afterEach(vi.clearAllMocks);

  it('should be identified by the subject', () => {
    render(<DeleteForm {...props} />);
    const form = screen.getByRole('form', { name });
    expect(form).toBeInTheDocument();
  });

  it('should display the given children', () => {
    const children = [
      <p key={0}>Blah</p>,
      <input key={1} type='text' aria-label='Foo' />,
    ];
    render(<DeleteForm {...props}>{children}</DeleteForm>);
    expect(screen.getByText('Blah')).toBeInTheDocument();
    expect(screen.getByLabelText('Foo')).toBeInTheDocument();
  });

  it('should represent the given form method', () => {
    const method = 'dialog';
    render(<DeleteForm {...{ ...props, method }} />);
    const form = screen.getByRole('form', { name }) as HTMLFormElement;
    expect(form.method).toBe(method);
  });

  it('should not call `onCancel` nor `onDelete` if no interaction have been done yet', () => {
    render(<DeleteForm {...props} />);
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onDelete).toHaveBeenCalledTimes(0);
  });

  it('should call the given `onCancel` function', async () => {
    const user = userEvent.setup();
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(0);
  });

  it('should call the given `onDelete` function', async () => {
    const user = userEvent.setup();
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should display the give error message', () => {
    const errorMessage = 'Test error';
    render(<DeleteForm {...{ ...props, errorMessage }} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
