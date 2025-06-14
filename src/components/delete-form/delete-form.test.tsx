import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { DeleteForm } from './delete-form';
import { delay } from '@/test-utils';

const onCancel = vi.fn();
const onSuccess = vi.fn();
const delReqFn = vi.fn(
  () =>
    new Promise<Response>((resolve) =>
      delay(() => resolve(new Response(null, { status: 204 })))
    )
);

const method = 'dialog';
const subject = 'Delete Test';
const name = new RegExp(subject);
const props = { method, subject, delReqFn, onCancel, onSuccess };

afterEach(vi.clearAllMocks);

describe('<DeletePostForm />', () => {
  it('should be identified by the post title', () => {
    render(<DeleteForm {...props} />);
    const form = screen.getByRole('form', { name });
    expect(form).toBeInTheDocument();
  });

  it('should represent the given form method', () => {
    render(<DeleteForm {...props} />);
    const form = screen.getByRole('form', { name }) as HTMLFormElement;
    expect(form.method).toBe('dialog');
  });

  it('should not call `onCancel` nor `onSuccess` if no interaction have been done yet', () => {
    render(<DeleteForm {...props} />);
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should call the given `onCancel` function', async () => {
    const user = userEvent.setup();
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should handle promise rejection and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    delReqFn.mockImplementationOnce(
      () => new Promise((_, reject) => delay(reject))
    );
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() =>
      expect(screen.getByText(/something .*wrong/i)).toBeInTheDocument()
    );
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should show response error and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    const error = 'Test error';
    delReqFn.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          delay(() => resolve(Response.json({ error }, { status: 400 })))
        )
    );
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(screen.getByText(error)).toBeInTheDocument());
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should show unauthorized error and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    const error = 'Test error';
    delReqFn.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          delay(() => resolve(Response.json({ error }, { status: 401 })))
        )
    );
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() =>
      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
    );
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should call `onSuccess` function', async () => {
    const user = userEvent.setup();
    delReqFn.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          delay(() => resolve(new Response(null, { status: 204 })))
        )
    );
    render(<DeleteForm {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(0);
  });
});
