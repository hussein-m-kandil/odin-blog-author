import './globals.css';
import { getBaseAuthData } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { Providers } from './providers';
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
  const baseAuthData = await getBaseAuthData();

  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Providers initAuthData={baseAuthData}>
          <Navbar />
          <div className='container mx-auto px-4'>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
