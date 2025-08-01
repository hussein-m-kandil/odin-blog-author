import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import { AuthProvider } from '@/contexts/auth-context';
import { DeletePostForm } from './delete-post-form';
import { initAuthData, post } from '@/test-utils';
import { render } from '@testing-library/react';
import { axiosMock } from '@/__mocks__/axios';

const DeletePostFormWrapper = (
  props: React.ComponentProps<typeof DeletePostForm>
) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <AuthProvider initAuthData={initAuthData}>
        <DeletePostForm {...props} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('<DeletePostForm />', () => {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();
  const props = { post, onSuccess, onCancel };

  afterEach(vi.clearAllMocks);

  beforeEach(() => axiosMock.onDelete().reply(204));

  it('should display at least part of the post title', () => {
    render(<DeletePostFormWrapper {...props} />);
    expect(screen.getByText(new RegExp(props.post.title))).toBeInTheDocument();
  });

  it('should handle promise rejection and not call `onSuccess` function', async () => {
    axiosMock.onDelete().abortRequest();
    const user = userEvent.setup();
    render(<DeletePostFormWrapper {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() =>
      expect(screen.getByText(/something .*wrong/i)).toBeInTheDocument()
    );
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should show response error and not call `onSuccess` function', async () => {
    const error = 'Test error';
    axiosMock.onDelete().reply(400, { error });
    const user = userEvent.setup();
    render(<DeletePostFormWrapper {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(screen.getByText(error)).toBeInTheDocument());
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should show unauthorized error and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    axiosMock.onDelete().reply(401);
    render(<DeletePostFormWrapper {...props} />);
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
    render(<DeletePostFormWrapper {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(0);
  });
});
