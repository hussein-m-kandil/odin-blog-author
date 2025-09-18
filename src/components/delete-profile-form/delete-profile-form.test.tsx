import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteProfileForm } from './delete-profile-form';
import { userEvent } from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import { AuthProvider } from '@/contexts/auth-context';
import { author, initAuthData } from '@/test-utils';
import { render } from '@testing-library/react';
import { axiosMock } from '@/../__mocks__/axios';

const DeleteProfileFormWrapper = (
  props: React.ComponentProps<typeof DeleteProfileForm>
) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <AuthProvider initAuthData={initAuthData}>
        <DeleteProfileForm {...props} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const username = initAuthData.user?.username || 'anonymous';

describe('<DeleteProfileForm />', () => {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();
  const props = { owner: author, onSuccess, onCancel };

  afterEach(vi.clearAllMocks);

  beforeEach(() => axiosMock.onDelete().reply(204));

  it('should display delete-profile form', () => {
    render(<DeleteProfileFormWrapper {...props} />);
    expect(screen.getByRole('form', { name: /profile/i })).toBeInTheDocument();
  });

  it('should display username input for delete confirmation', () => {
    render(<DeleteProfileFormWrapper {...props} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your username/i)).toBeInTheDocument();
  });

  it('should not delete if the username is not entered', async () => {
    axiosMock.onDelete().abortRequest();
    const user = userEvent.setup();
    render(<DeleteProfileFormWrapper {...props} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/username.* required/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /deleting/i })).toBeNull();
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should not delete if the username is wrong', async () => {
    axiosMock.onDelete().abortRequest();
    const user = userEvent.setup();
    render(<DeleteProfileFormWrapper {...props} />);
    await user.type(screen.getByLabelText(/username/i), 'blah_blah');
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/username.* wrong/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /deleting/i })).toBeNull();
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should handle promise rejection and not call `onSuccess` function', async () => {
    axiosMock.onDelete().abortRequest();
    const user = userEvent.setup();
    render(<DeleteProfileFormWrapper {...props} />);
    await user.type(screen.getByLabelText(/username/i), username);
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
    render(<DeleteProfileFormWrapper {...props} />);
    await user.type(screen.getByLabelText(/username/i), username);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(screen.getByText(error)).toBeInTheDocument());
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should show unauthorized error and not call `onSuccess` function', async () => {
    const user = userEvent.setup();
    axiosMock.onDelete().reply(401);
    render(<DeleteProfileFormWrapper {...props} />);
    await user.type(screen.getByLabelText(/username/i), username);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /deleting/i })).toBeNull()
    );
    expect(onCancel).toHaveBeenCalledTimes(0);
    expect(onSuccess).toHaveBeenCalledTimes(0);
  });

  it('should call `onSuccess` function', async () => {
    const user = userEvent.setup();
    render(<DeleteProfileFormWrapper {...props} />);
    await user.type(screen.getByLabelText(/username/i), username);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => screen.getByRole('button', { name: /deleting/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(0);
  });
});
