import DeletePostForm from './delete-post-form';
import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { post } from '@/test-utils';

const onCancelMock = vi.fn();
const onSuccessMock = vi.fn();

const fetchSpy = vi.spyOn(window, 'fetch');

afterEach(vi.clearAllMocks);

describe('<DeletePostForm />', () => {
  it('should be identified by the post title', () => {
    render(
      <DeletePostForm
        post={post}
        onCancel={onCancelMock}
        onSuccess={onSuccessMock}
      />
    );
    const form = screen.getByRole('form', { name: new RegExp(post.title) });
    expect(form).toBeInTheDocument();
  });

  it('should represent the given form method', () => {
    render(
      <DeletePostForm
        post={post}
        method='dialog'
        onCancel={onCancelMock}
        onSuccess={onSuccessMock}
      />
    );
    const form = screen.getByRole('form', {
      name: new RegExp(post.title),
    }) as HTMLFormElement;
    expect(form.method).toBe('dialog');
  });

  it('should call the given `onCancel` function', async () => {
    const user = userEvent.setup();
    render(
      <DeletePostForm
        post={post}
        method='dialog'
        onCancel={onCancelMock}
        onSuccess={onSuccessMock}
      />
    );
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
  });

  it('should handle promise rejection and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    fetchSpy.mockImplementationOnce(
      () => new Promise((_, reject) => setTimeout(reject, 50))
    );
    render(
      <DeletePostForm
        post={post}
        method='dialog'
        onCancel={onCancelMock}
        onSuccess={onSuccessMock}
      />
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /deleting/i })
    );
    expect(onCancelMock).toHaveBeenCalledTimes(0);
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(/something .*wrong/i)).toBeInTheDocument();
  });

  it('should show response error and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    const error = 'Test error';
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Response.json({ error }, { status: 400 })),
            50
          )
        )
    );
    render(
      <DeletePostForm
        post={post}
        method='dialog'
        onCancel={onCancelMock}
        onSuccess={onSuccessMock}
      />
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /deleting/i })
    );
    expect(onCancelMock).toHaveBeenCalledTimes(0);
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(error)).toBeInTheDocument();
  });

  it('should show unauthorized error and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    const error = 'Test error';
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Response.json({ error }, { status: 401 })),
            50
          )
        )
    );
    render(
      <DeletePostForm
        post={post}
        method='dialog'
        onCancel={onCancelMock}
        onSuccess={onSuccessMock}
      />
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /deleting/i })
    );
    expect(onCancelMock).toHaveBeenCalledTimes(0);
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(await screen.findByText(/unauthorized/i)).toBeInTheDocument();
  });

  it('should call `onSuccess` function', async () => {
    const user = userEvent.setup();
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(new Response(null, { status: 204 })), 50)
        )
    );
    render(
      <DeletePostForm
        post={post}
        method='dialog'
        onCancel={onCancelMock}
        onSuccess={onSuccessMock}
      />
    );
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onCancelMock).toHaveBeenCalledTimes(0);
    expect(onSuccessMock).toHaveBeenCalledTimes(0);
    expect(
      await screen.findByRole('button', { name: /deleting/i })
    ).toBeInTheDocument();
    await waitFor(() => expect(onSuccessMock).toHaveBeenCalledTimes(1));
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCancelMock).toHaveBeenCalledTimes(0);
  });
});
