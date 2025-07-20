'use client';

import React from 'react';
import { AuthData, InitAuthData } from '@/types';

export type AuthContextValue = {
  setAuthData: (data: InitAuthData) => void;
  authData: AuthData;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

const createAuthFetch = (authToken?: string): typeof fetch => {
  if (!authToken) return fetch;
  return (url, init) => {
    const reqInit: RequestInit = init || {};
    const headers: HeadersInit = { Authorization: authToken };
    reqInit.headers = reqInit.headers
      ? { ...headers, ...reqInit.headers }
      : headers;
    return fetch(url, reqInit);
  };
};

const extendInitData = (data: InitAuthData) => {
  return { ...data, authFetch: createAuthFetch(data.token) };
};

export function AuthProvider({
  initAuthData: initData,
  children,
}: Readonly<{
  children: React.ReactNode;
  initAuthData: InitAuthData;
}>) {
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
