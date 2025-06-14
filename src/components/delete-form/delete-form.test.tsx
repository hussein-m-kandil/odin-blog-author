import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { DeleteForm } from './delete-form';

const onCancel = vi.fn();
const onSubmit = vi.fn();

const subject = 'foo';
const method = 'dialog';
const props = { method, subject, onSubmit, onCancel };

const name = new RegExp(subject, 'i');

afterEach(vi.clearAllMocks);

describe('<DeletePostForm />', () => {
  it('should be identified by the given subject', () => {
    render(<DeleteForm {...props} />);
    const form = screen.getByRole('form', { name });
    expect(form).toBeInTheDocument();
  });

  it('should represent the given form method', () => {
    render(<DeleteForm {...props} />);
    const form = screen.getByRole('form', { name }) as HTMLFormElement;
    expect(form.method).toBe('dialog');
  });

  it('should not call `onCancel` nor `onSubmit` if their corresponding button not clicked', () => {
    render(<DeleteForm {...props} />);
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it('should call the given `onCancel` function', async () => {
    const user = userEvent.setup();
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it('should show the given error message', () => {
    const errorMessage = 'Test error';
    render(<DeleteForm {...props} errorMessage={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show `deleting` button call `onSubmit` function', async () => {
    const user = userEvent.setup();
    // Delay `onSubmit` job to see the `deleting` button
    onSubmit.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(0);
  });
});
