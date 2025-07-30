import { AuthProvider, useAuthData } from './auth-context';
import { beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { axiosMock } from '@/__mocks__/axios';
import { initAuthData } from '@/test-utils';
import { BaseAuthData } from '@/types';

const newAuthData: BaseAuthData = {
  ...initAuthData,
  token: 'new-test-token',
  user: null,
};

const assertAuthDataDisplayed = (data: BaseAuthData) => {
  const { token, user, authUrl, backendUrl } = data;
  expect(screen.getByText(authUrl)).toBeInTheDocument();
  expect(screen.getByText(backendUrl)).toBeInTheDocument();
  if (token) expect(screen.getByText(token)).toBeInTheDocument();
  if (user) expect(screen.getByText(user.username)).toBeInTheDocument();
};

const reqTriggerName = 'Send authorized request';

function AuthConsumer() {
  const { authData, setAuthData } = useAuthData();
  return (
    <div>
      <div>{authData.token}</div>
      <div>{authData.user?.username}</div>
      <div>{authData.backendUrl}</div>
      <div>{authData.authUrl}</div>
      <button type='button' onClick={() => setAuthData(newAuthData)}>
        change data
      </button>
      <button
        type='button'
        onClick={() => authData.authAxios.get(authData.backendUrl)}>
        {reqTriggerName}
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
  beforeEach(() => axiosMock.onGet().reply(200));

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

  it('should `axios` be an authorized instance of `axios` created', async () => {
    const user = userEvent.setup();
    render(<AuthWrapper initAuthData={initAuthData} />);
    await user.click(screen.getByRole('button', { name: reqTriggerName }));
    expect(axiosMock.history.get[0].headers?.Authorization).toBe(
      initAuthData.token
    );
  });
});
