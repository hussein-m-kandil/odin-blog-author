import { DialogProvider } from '@/contexts/dialog-context/';

import './globals.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | Odin Blog Author', default: 'Odin Blog Author' },
  description:
    'A front-end app for authoring blog posts that I built as part of "The Odin Project - NodeJS" course.',
  icons: '/top.svg',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
