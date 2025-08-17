import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { author, initAuthData } from '@/test-utils';
import { axiosMock } from '@/__mocks__/axios';
import { AvatarForm } from './avatar-form';

vi.mock('@/components/image-form', async () => {
  type ImageFormProps = { onSuccess: (image: { id: string } | null) => void };
  const ImageForm = ({ onSuccess }: ImageFormProps) => {
    return (
      <button type='button' onClick={() => onSuccess({ id: 'blah-image' })}>
        Fake Upload
      </button>
    );
  };
  return { default: ImageForm, ImageForm };
});

const AvatarFormWrapper = (props: React.ComponentProps<typeof AvatarForm>) => {
  return (
    <AuthProvider initAuthData={initAuthData}>
      <AvatarForm {...props} />
    </AuthProvider>
  );
};

describe('<AvatarForm />', () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onAny().reply(200, initAuthData);
  });

  it('should send PATCH request after upload, and with correct url/data', async () => {
    const user = userEvent.setup();
    render(<AvatarFormWrapper />);
    await user.click(screen.getByRole('button', { name: 'Fake Upload' }));
    expect(axiosMock.history.patch).toHaveLength(1);
    expect(axiosMock.history.patch[0].url).toMatch(
      new RegExp(`/${author.id}$`)
    );
    expect(axiosMock.history.patch[0].data).toStrictEqual(
      JSON.stringify({ avatar: 'blah-image' })
    );
  });

  it('should show error message and try-again button on network error', async () => {
    axiosMock.reset();
    axiosMock.onAny().networkError();
    const user = userEvent.setup();
    render(<AvatarFormWrapper />);
    await user.click(screen.getByRole('button', { name: 'Fake Upload' }));
    expect(axiosMock.history.patch).toHaveLength(1);
    await waitFor(() => screen.getByRole('button', { name: /try/i }));
    expect(screen.getByText(/could not save/i)).toBeInTheDocument();
  });

  it('should show error message and try-again button on failed PATCH request', async () => {
    axiosMock.reset();
    axiosMock.onAny().reply(400);
    const user = userEvent.setup();
    render(<AvatarFormWrapper />);
    await user.click(screen.getByRole('button', { name: 'Fake Upload' }));
    expect(axiosMock.history.patch).toHaveLength(1);
    await waitFor(() => screen.getByRole('button', { name: /try/i }));
    expect(screen.getByText(/could not save/i)).toBeInTheDocument();
  });

  it('should resend the PATCH request on try-again button clicked', async () => {
    axiosMock.reset();
    axiosMock.onAny().networkError();
    const user = userEvent.setup();
    render(<AvatarFormWrapper />);
    await user.click(screen.getByRole('button', { name: 'Fake Upload' }));
    await waitFor(() => screen.getByRole('button', { name: /try/i }));
    await user.click(screen.getByRole('button', { name: /try/i }));
    expect(axiosMock.history.patch).toHaveLength(2);
    for (const req of axiosMock.history.patch) {
      expect(req.url).toMatch(new RegExp(`/${author.id}$`));
      expect(req.data).toStrictEqual(JSON.stringify({ avatar: 'blah-image' }));
    }
  });

  it('should not display the close button if not given `onClose` prop', () => {
    render(<AvatarFormWrapper />);
    expect(screen.queryByRole('button', { name: /close/i })).toBeNull();
  });

  it('should display the close button if not given `onClose` prop', () => {
    render(<AvatarFormWrapper onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should call the given `onClose` after clicking the close button', async () => {
    const onCloseMock = vi.fn();
    const user = userEvent.setup();
    render(<AvatarFormWrapper onClose={onCloseMock} />);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onCloseMock).toHaveBeenCalledOnce();
  });
});
