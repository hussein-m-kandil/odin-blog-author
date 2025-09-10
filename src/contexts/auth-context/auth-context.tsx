'use client';

import axios from 'axios';
import * as React from 'react';
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

const extendBaseAuthData = (baseAuthData: BaseAuthData) => {
  return {
    ...baseAuthData,
    authAxios: axios.create({
      headers: { Authorization: baseAuthData.token },
      baseURL: baseAuthData.backendUrl,
      withCredentials: true,
    }),
  };
};

export function AuthProvider({ initAuthData, children }: AuthProviderProps) {
  const [authData, setAuthData] = React.useState<ClientAuthData>(
    extendBaseAuthData(initAuthData)
  );

  const signin = (authResData: AuthResData) => {
    setAuthData(extendBaseAuthData({ ...authData, ...authResData }));
  };

  const signout = () => {
    setAuthData({ ...authData, user: null, token: '' });
  };

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
