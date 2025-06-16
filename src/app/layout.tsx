import './globals.css';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { DialogProvider } from '@/contexts/dialog-context/';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: { template: '%s | Odin Blog Author', default: 'Odin Blog Author' },
  description:
    'A front-end app for authoring blog posts that I built as part of "The Odin Project - NodeJS" course.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider
          enableSystem
          attribute='class'
          defaultTheme='system'
          disableTransitionOnChange>
          <DialogProvider>{children}</DialogProvider>
          <Toaster expand visibleToasts={3} richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
