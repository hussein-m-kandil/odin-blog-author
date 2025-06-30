'use client';

import React from 'react';
import { AuthData } from '@/types';

export interface AuthContextValue {
  setAuthData: (data: AuthData) => void;
  authData: AuthData;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initAuthData: initData,
  children,
}: Readonly<{
  children: React.ReactNode;
  initAuthData: AuthData;
}>) {
  const [authData, setAuthData] = React.useState<AuthData>(initData);

  return (
    <AuthContext value={{ authData, setAuthData }}>{children}</AuthContext>
  );
}

export function useAuthData() {
  const authData = React.useContext(AuthContext);

  if (!authData) {
    throw new Error('`useAuthData` must be called within `AuthProvider`');
  }

  return authData;
}
