import { getSignedInUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSignedInUser();

  if (!user) {
    return redirect('/signin');
  }

  return <div className='container mx-auto px-4'>{children}</div>;
}
