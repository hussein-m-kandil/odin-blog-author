import React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { AuthProvider, useAuthData } from './auth-context';
import { beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { author, initAuthData } from '@/test-utils';
import { axiosMock } from '@/../__mocks__/axios';
import { AuthResData } from '@/types';

const newAuthData: AuthResData = {
  user: { ...author, username: 'test_user' },
  token: 'new-test-token',
};

const reqTriggerName = 'Send authorized request';

function AuthConsumer() {
  const [errorMessage, setErrorMessage] = React.useState('');
  const { authData, signin, signout } = useAuthData();
  return (
    <div>
      {errorMessage && <div>{errorMessage}</div>}
      {authData.token && <div>user token: {authData.token}</div>}
      {authData.user && <div>username: {authData.user.username}</div>}
      <div>{authData.backendUrl}</div>
      <div>{authData.authUrl}</div>
      <button type='button' onClick={() => signin(newAuthData)}>
        signin
      </button>
      <button type='button' onClick={() => signout()}>
        signout
      </button>
      <button
        type='button'
        onClick={() => {
          authData.authAxios
            .get(authData.backendUrl)
            .then(() => setErrorMessage(''))
            .catch((error: unknown) => {
              setErrorMessage(
                error instanceof Error &&
                  'status' in error &&
                  error.status === 401
                  ? 'Unauthorized'
                  : 'Something went wrong'
              );
            });
        }}>
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
  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onAny().reply(200);
  });

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
    const { backendUrl, authUrl, user, token } = initAuthData;
    expect(screen.getByText(authUrl)).toBeInTheDocument();
    expect(screen.getByText(backendUrl)).toBeInTheDocument();
    if (token) expect(screen.getByText(new RegExp(token))).toBeInTheDocument();
    else expect(screen.queryByText(/token/i)).toBeNull();
    if (user)
      expect(screen.getByText(new RegExp(user.username))).toBeInTheDocument();
    else expect(screen.queryByText(/username/i)).toBeNull();
  });

  it('should sign in the provided data', async () => {
    const user = userEvent.setup();
    render(<AuthWrapper initAuthData={initAuthData} />);
    await user.click(screen.getByRole('button', { name: /signin/i }));
    const {
      user: { username },
      token,
    } = newAuthData;
    expect(screen.getByText(new RegExp(token))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(username))).toBeInTheDocument();
  });

  it('should signout', async () => {
    const user = userEvent.setup();
    render(<AuthWrapper initAuthData={initAuthData} />);
    await user.click(screen.getByRole('button', { name: /signout/i }));
    expect(screen.queryByText(/token/i)).toBeNull();
    expect(screen.queryByText(/username/i)).toBeNull();
  });

  it('should `axios` be an authorized instance of `axios` created', async () => {
    const user = userEvent.setup();
    render(<AuthWrapper initAuthData={initAuthData} />);
    await user.click(screen.getByRole('button', { name: reqTriggerName }));
    expect(axiosMock.history.get[0].headers?.Authorization).toBe(
      initAuthData.token
    );
  });

  it('should signout & `axios` be unauthorized after 401 response', async () => {
    axiosMock.onGet().reply(401);
    const user = userEvent.setup();
    render(<AuthWrapper initAuthData={initAuthData} />);
    await user.click(screen.getByRole('button', { name: reqTriggerName }));
    await waitForElementToBeRemoved(() => screen.getByText(/token/i));
    await user.click(screen.getByRole('button', { name: reqTriggerName }));
    expect(screen.queryByText(/username/i)).toBeNull();
    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
    expect(axiosMock.history.get[0].headers?.Authorization).toBe(
      initAuthData.token
    );
    expect(axiosMock.history.get[1].headers?.Authorization).toBe('');
  });
});
