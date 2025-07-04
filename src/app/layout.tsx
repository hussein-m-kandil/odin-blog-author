import './globals.css';
import { DialogProvider } from '@/contexts/dialog-context/';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from 'next-themes';
import { getAuthData } from '@/lib/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
    default: process.env.NEXT_PUBLIC_APP_NAME || '',
  },
  description:
    'A front-end app for authoring blog posts that I built as part of "The Odin Project - NodeJS" course.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authData = await getAuthData();

  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <AuthProvider initAuthData={authData}>
          <ThemeProvider
            enableSystem
            attribute='class'
            defaultTheme='system'
            disableTransitionOnChange>
            <DialogProvider>
              <Navbar />
              {children}
            </DialogProvider>
            <Toaster expand visibleToasts={3} richColors closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
