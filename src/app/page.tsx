import { getSignedInUser } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getSignedInUser();

  if (!user) {
    return redirect('/signin');
  }

  return (
    <>
      <header>
        <Navbar user={user} />
      </header>
      <main>
        <div>Home page...</div>
      </main>
    </>
  );
}
