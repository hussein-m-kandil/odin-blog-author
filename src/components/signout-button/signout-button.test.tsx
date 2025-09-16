import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { axiosMock } from '@/../__mocks__/axios';
import { initAuthData } from '@/test-utils';
import { Toaster } from 'sonner';

const getAuthDataMock = vi.fn(() => initAuthData);
const replaceRouteMock = vi.fn();
const signoutMock = vi.fn();

vi.unmock('next/navigation');

vi.doMock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({
    replace: replaceRouteMock,
    prefetch: vi.fn(),
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.doMock('@/contexts/auth-context', async (importOriginal) => {
  const originalModule = await importOriginal<{ useAuthData: () => object }>();
  return {
    ...originalModule,
    useAuthData: () => ({
      ...originalModule.useAuthData(),
      signout: signoutMock,
    }),
  };
});

const { AuthProvider } = await import('@/contexts/auth-context');
const { SignoutButton } = await import('./signout-button');

const SignoutButtonWrapper = (
  props: React.ComponentProps<typeof SignoutButton>
) => {
  return (
    <AuthProvider initAuthData={getAuthDataMock()}>
      <SignoutButton {...props} />
      <Toaster />
    </AuthProvider>
  );
};

describe('<SignoutButton />', async () => {
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onAny().reply(200);
  });

  afterEach(vi.clearAllMocks);

  it('should call `signout`, redirect to the signin route, and return nothing if user is not signed in', async () => {
    const authData = { ...initAuthData, token: '', user: null };
    getAuthDataMock.mockImplementationOnce(() => authData);
    render(<SignoutButtonWrapper />);
    expect(signoutMock).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button')).toBeNull();
    expect(replaceRouteMock).toHaveBeenCalledExactlyOnceWith('/signin');
  });

  it('should display a signout button with the given props', () => {
    const props = { id: 'test-id', ['data-test']: 'test-data' };
    render(<SignoutButtonWrapper {...props} className='test-class' />);
    const signoutBtn = screen.getByRole('button');
    expect(signoutBtn).toHaveTextContent(/sign ?out/i);
    expect(signoutBtn).toHaveClass('test-class');
    for (const [k, v] of Object.entries(props)) {
      expect(signoutBtn).toHaveAttribute(k, v);
    }
  });

  it('should display the generic error message', async () => {
    axiosMock.onPost().abortRequest();
    const user = userEvent.setup();
    render(<SignoutButtonWrapper />);
    await user.click(screen.getByRole('button'));
    await waitForElementToBeRemoved(() => screen.getByText(/signing out/i));
    expect(screen.getByText(/something .*wrong/i)).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(1);
  });

  it('should display the retrieved error message', async () => {
    const data = { error: { message: 'Test error!' } };
    axiosMock.onPost().reply(400, data);
    const user = userEvent.setup();
    render(<SignoutButtonWrapper />);
    await user.click(screen.getByRole('button'));
    await waitForElementToBeRemoved(() => screen.getByText(/signing out/i));
    expect(screen.getByText(data.error.message)).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(1);
  });

  it('should send signout request on the right URL, and with the right base URL', async () => {
    const user = userEvent.setup();
    render(<SignoutButtonWrapper />);
    await user.click(screen.getByRole('button'));
    await waitForElementToBeRemoved(() => screen.getByText(/signing out/i));
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].baseURL).toBe('');
    expect(axiosMock.history.post[0].url).toBe('/auth/signout');
  });

  it('should signout, redirect to the signin route, and show success message', async () => {
    const user = userEvent.setup();
    render(<SignoutButtonWrapper />);
    await user.click(screen.getByRole('button'));
    await waitForElementToBeRemoved(() => screen.getByText(/signing out/i));
    expect(replaceRouteMock).toHaveBeenCalledExactlyOnceWith('/signin');
    expect(screen.getByText(/bye/i)).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(1);
    expect(signoutMock).toHaveBeenCalledOnce();
  });

  it('should disable the button while signing out, and remain disabled on success', async () => {
    const user = userEvent.setup();
    render(<SignoutButtonWrapper />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeDisabled();
    await waitForElementToBeRemoved(() => screen.getByText(/signing out/i));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should disable the button while signing out, and re-enable it on error', async () => {
    axiosMock.onPost().networkError();
    const user = userEvent.setup();
    render(<SignoutButtonWrapper />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeDisabled();
    await waitForElementToBeRemoved(() => screen.getByText(/signing out/i));
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});
