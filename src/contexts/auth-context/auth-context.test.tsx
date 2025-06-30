import { AuthProvider, useAuthData } from './auth-context';
import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { initAuthData } from '@/test-utils';
import { AuthData } from '@/types';

const newAuthData: AuthData = {
  backendUrl: 'https://new-test.com/api/v1',
  token: 'new-test-token',
  user: null,
};

const assertAuthDataDisplayed = (data: AuthData) => {
  const { token, user, backendUrl } = data;
  expect(screen.getByText(backendUrl)).toBeInTheDocument();
  if (token) expect(screen.getByText(token)).toBeInTheDocument();
  if (user) expect(screen.getByText(user.username)).toBeInTheDocument();
};

function AuthConsumer() {
  const { authData, setAuthData } = useAuthData();
  return (
    <div>
      <div>{authData.token}</div>
      <div>{authData.user?.username}</div>
      <div>{authData.backendUrl}</div>
      <button type='button' onClick={() => setAuthData(newAuthData)}>
        change data
      </button>
    </div>
  );
}

function AuthWrapper(
  props: Omit<React.ComponentProps<typeof AuthProvider>, 'children'>
) {
  return (
    <AuthProvider {...props}>
      <div>
        <AuthConsumer />
      </div>
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  it('should `useAuthData` throw if used outside of `AuthProvider`', () => {
    expect(() =>
      render(
        <div>
          <AuthConsumer />
        </div>
      )
    ).toThrowError(/AuthProvider/i);
    expect(() =>
      render(<AuthWrapper initAuthData={initAuthData} />)
    ).not.toThrowError();
  });

  it('should provide the given data', () => {
    render(<AuthWrapper initAuthData={initAuthData} />);
    assertAuthDataDisplayed(initAuthData);
  });

  it('should change the provided data', async () => {
    const user = userEvent.setup();
    render(<AuthWrapper initAuthData={initAuthData} />);
    await user.click(screen.getByRole('button', { name: /change/i }));
    assertAuthDataDisplayed(newAuthData);
  });
});
