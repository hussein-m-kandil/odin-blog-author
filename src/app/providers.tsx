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
    defaultOptions: {
      queries: {
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        refetchInterval: 5 * 60 * 1000,
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

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
    <ThemeProvider
      enableSystem
      attribute='class'
      defaultTheme='system'
      disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AuthProvider initAuthData={authData}>
          <DialogProvider>{children}</DialogProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster expand visibleToasts={3} richColors closeButton />
    </ThemeProvider>
  );
}

export default Providers;
