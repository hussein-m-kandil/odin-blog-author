'use client';

import axios from 'axios';
import * as React from 'react';
import { AuthData, InitAuthData } from '@/types';

export type AuthContextValue = {
  setAuthData: (data: InitAuthData) => void;
  authData: AuthData;
};

export type AuthProviderProps = Readonly<{
  children?: React.ReactNode;
  initAuthData: InitAuthData;
}>;

const AuthContext = React.createContext<AuthContextValue | null>(null);

const extendInitData = (data: InitAuthData) => {
  return {
    ...data,
    authAxios: axios.create({
      headers: { Authorization: data.token },
      baseURL: data.backendUrl,
    }),
  };
};

export function AuthProvider({
  initAuthData: initData,
  children,
}: AuthProviderProps) {
  const [data, setData] = React.useState<AuthData>(extendInitData(initData));

  const contextValue: AuthContextValue = {
    setAuthData: (data) => setData(extendInitData(data)),
    authData: data,
  };

  return <AuthContext value={contextValue}>{children}</AuthContext>;
}

export function useAuthData() {
  const authData = React.useContext(AuthContext);

  if (!authData) {
    throw new Error('`useAuthData` must be called within `AuthProvider`');
  }

  return authData;
}
