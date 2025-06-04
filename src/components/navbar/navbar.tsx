'use client';

import Link from 'next/link';
import { User } from '@/types';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { H1 } from '@/components/typography/h1';
import { ModeToggle } from '@/components/mode-toggle';
import { PostFormDialog } from '@/components/post-form-dialog';

export function Navbar({ user = null }: { user?: User | null }) {
  const pathname = usePathname();

  const btnCommonProps: { variant: 'outline' } = {
    variant: 'outline',
  };

  return (
    <nav className='flex flex-col sm:flex-row items-center justify-between gap-2 p-3 shadow-sm shadow-secondary'>
      <H1 className='text-3xl font-normal'>
        <Link href='/'>Odin Blog Author</Link>
      </H1>
      <div className='flex items-center gap-2'>
        {user ? (
          <>
            <PostFormDialog />
            <form
              action={`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signout`}
              method='post'>
              <Button type='submit' {...btnCommonProps}>
                Sign out
              </Button>
            </form>
          </>
        ) : (
          <Button type='button' {...btnCommonProps} asChild>
            {pathname === '/signin' ? (
              <Link href='/signup'>Sign up</Link>
            ) : (
              <Link href='/signin'>Sign in</Link>
            )}
          </Button>
        )}
        <ModeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
