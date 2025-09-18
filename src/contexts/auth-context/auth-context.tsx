'use client';

import React from 'react';
import axios from 'axios';
import { ClientAuthData, BaseAuthData, AuthResData } from '@/types';

export type AuthContextValue = {
  signin: (data: AuthResData) => void;
  authData: ClientAuthData;
  signout: () => void;
};

export type AuthProviderProps = Readonly<{
  children?: React.ReactNode;
  initAuthData: BaseAuthData;
}>;

const AuthContext = React.createContext<AuthContextValue | null>(null);

const injectAuthAxios = (baseAuthData: BaseAuthData) => {
  const authAxios = axios.create({
    headers: { Authorization: baseAuthData.token },
    baseURL: baseAuthData.backendUrl,
    withCredentials: true,
  });
  return { ...baseAuthData, authAxios };
};

export function AuthProvider({ initAuthData, children }: AuthProviderProps) {
  const [authData, setAuthData] = React.useState<ClientAuthData>(
    injectAuthAxios(initAuthData)
  );

  const signin = (authResData: AuthResData) => {
    setAuthData(injectAuthAxios({ ...authData, ...authResData }));
  };

  const signout = React.useCallback(() => {
    setAuthData(injectAuthAxios({ ...authData, user: null, token: '' }));
  }, [authData]);

  React.useEffect(() => {
    const { authAxios } = authData;
    authAxios.defaults.validateStatus = (status) => {
      // If server respond with an unauthorized status
      if (status === 401) {
        authAxios.defaults.headers.Authorization = ''; // Delete auth header
        signout(); // Signout unauthorized user
      }
      return status >= 200 && status < 300; // Default status validation
    };
  }, [authData, signout]);

  return (
    <AuthContext value={{ authData, signin, signout }}>{children}</AuthContext>
  );
}

export function useAuthData() {
  const authData = React.useContext(AuthContext);

  if (!authData) {
    throw new Error('`useAuthData` must be called within `AuthProvider`');
  }

  return authData;
}
