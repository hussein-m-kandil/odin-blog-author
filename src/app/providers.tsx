'use client';

import { DialogProvider } from '@/contexts/dialog-context/';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AuthData } from '@/types';

export function Providers({
  authData,
  children,
}: {
  authData: AuthData;
  children: React.ReactNode;
}) {
  return (
    <AuthProvider initAuthData={authData}>
      <ThemeProvider
        enableSystem
        attribute='class'
        defaultTheme='system'
        disableTransitionOnChange>
        <DialogProvider>{children}</DialogProvider>
        <Toaster expand visibleToasts={3} richColors closeButton />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default Providers;
