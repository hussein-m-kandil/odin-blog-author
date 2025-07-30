'use client';

import axios from 'axios';
import * as React from 'react';
import { ClientAuthData, BaseAuthData } from '@/types';

export type AuthContextValue = {
  setAuthData: (data: BaseAuthData) => void;
  authData: ClientAuthData;
};

export type AuthProviderProps = Readonly<{
  children?: React.ReactNode;
  initAuthData: BaseAuthData;
}>;

const AuthContext = React.createContext<AuthContextValue | null>(null);

const extendInitData = (data: BaseAuthData) => {
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
  const [data, setData] = React.useState<ClientAuthData>(
    extendInitData(initData)
  );

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
