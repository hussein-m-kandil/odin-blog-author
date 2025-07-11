import './globals.css';
import { getAuthData, getCurrentPathname } from '@/lib/auth';
import { DialogProvider } from '@/contexts/dialog-context/';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from 'next-themes';
import { redirect } from 'next/navigation';
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
  const pathname = await getCurrentPathname();
  const authData = await getAuthData();

  if (!authData.user && !/\/sign(in|up)/.test(pathname)) {
    return redirect('/signin');
  }

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
              <div className='container mx-auto px-4'>{children}</div>
            </DialogProvider>
            <Toaster expand visibleToasts={3} richColors closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
