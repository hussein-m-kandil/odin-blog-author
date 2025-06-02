'use client';

import Link from 'next/link';
import { User } from '@/types';
import { H1 } from '../typography/h1';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import { PostFormDialog } from '../post-form-dialog';

export function Navbar({ user = null }: { user?: User | null }) {
  const pathname = usePathname();

  const btnCommonProps: { variant: 'outline'; className: string } = {
    variant: 'outline',
    className: 'font-bold',
  };

  return (
    <nav className='flex items-center justify-between p-4 shadow-sm shadow-secondary'>
      <H1 className='text-3xl'>
        <Link href='/'>Odin Blog Author</Link>
      </H1>
      {user ? (
        <div className='flex items-center gap-4'>
          <PostFormDialog />
          <form
            action={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signout`}
            method='post'>
            <Button type='submit' {...btnCommonProps}>
              Sign out
            </Button>
          </form>
        </div>
      ) : (
        <Button type='button' {...btnCommonProps} asChild>
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
