import './globals.css';
import { getAuthData, getCurrentPathname } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { redirect } from 'next/navigation';
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
  const pathname = await getCurrentPathname();
  const authData = await getAuthData();

  if (!authData.user && !/\/sign(in|up)/.test(pathname)) {
    return redirect('/signin');
  }

  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Providers authData={authData}>
          <Navbar />
          <div className='container mx-auto px-4'>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
