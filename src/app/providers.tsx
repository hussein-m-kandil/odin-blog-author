'use client';

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { DialogProvider } from '@/contexts/dialog-context/';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AuthData } from '@/types';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({
  authData,
  children,
}: {
  authData: AuthData;
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <AuthProvider initAuthData={authData}>
      <ThemeProvider
        enableSystem
        attribute='class'
        defaultTheme='system'
        disableTransitionOnChange>
        <DialogProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </DialogProvider>
        <Toaster expand visibleToasts={3} richColors closeButton />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default Providers;
