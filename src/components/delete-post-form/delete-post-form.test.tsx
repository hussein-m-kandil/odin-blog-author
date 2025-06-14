import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { DeletePostForm } from './delete-post-form';
import { post } from '@/test-utils';

const RES_DELAY = 100;

const onCancel = vi.fn();
const onSuccess = vi.fn();

const props = { method: 'dialog', post, onCancel, onSuccess };

const fetchSpy = vi.spyOn(window, 'fetch');

afterEach(vi.clearAllMocks);

describe('<DeletePostForm />', () => {
  it('should be identified by the post title', () => {
    render(<DeletePostForm {...props} />);
    const form = screen.getByRole('form', { name: new RegExp(post.title) });
    expect(form).toBeInTheDocument();
  });

  it('should represent the given form method', () => {
    render(<DeletePostForm {...props} />);
    const form = screen.getByRole('form', {
      name: new RegExp(post.title),
    }) as HTMLFormElement;
    expect(form.method).toBe('dialog');
  });

  it('should not call `onCancel` nor `onSuccess` if no interaction have been done yet', () => {
    render(<DeletePostForm {...props} />);
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should call the given `onCancel` function', async () => {
    const user = userEvent.setup();
    render(<DeletePostForm {...props} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should handle promise rejection and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    fetchSpy.mockImplementationOnce(
      () => new Promise((_, reject) => setTimeout(reject, RES_DELAY))
    );
    render(<DeletePostForm {...props} />);
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
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Response.json({ error }, { status: 400 })),
            RES_DELAY
          )
        )
    );
    render(<DeletePostForm {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(screen.getByText(error)).toBeInTheDocument());
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should show unauthorized error and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    const error = 'Test error';
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Response.json({ error }, { status: 401 })),
            RES_DELAY
          )
        )
    );
    render(<DeletePostForm {...props} />);
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
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(new Response(null, { status: 204 })),
            RES_DELAY
          )
        )
    );
    render(<DeletePostForm {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(0);
  });
});
