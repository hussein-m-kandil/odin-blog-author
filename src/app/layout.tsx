import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import { H1 } from '@/components/typography/h1';
import { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { template: '%s | Odin Blog Author', default: 'Odin Blog Author' },
  description:
    'A front-end app for authoring blog posts that I built as part of "The Odin Project - NodeJS" course.',
  icons: '/top.svg',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header>
          <H1>Odin Blog Author</H1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
