import { Navbar } from '@/components/navbar';
import { getSignedInUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSignedInUser();

  if (!user) {
    return redirect('/signin');
  }

  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
}
