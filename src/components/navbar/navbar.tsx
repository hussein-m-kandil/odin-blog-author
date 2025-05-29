'use client';

import Link from 'next/link';
import { User } from '@/types';
import { H1 } from '../typography/h1';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';

export function Navbar({ user = null }: { user?: User | null }) {
  const pathname = usePathname();

  return (
    <nav className='flex items-center justify-between p-4 shadow-sm shadow-secondary'>
      <H1 className='text-3xl'>
        <Link href='/'>Odin Blog Author</Link>
      </H1>
      {user ? (
        <form
          action={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signout`}
          method='post'>
          <Button type='submit'>Sign out</Button>
        </form>
      ) : (
        <Button type='button' asChild>
          {pathname === '/signin' ? (
            <Link href='/signup'>Sign up</Link>
          ) : (
            <Link href='/signin'>Sign in</Link>
          )}
        </Button>
      )}
    </nav>
  );
}

export default Navbar;
