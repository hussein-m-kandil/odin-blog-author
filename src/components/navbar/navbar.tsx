'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { H1 } from '@/components/typography/h1';
import { getUnknownErrorMessage } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { usePathname, useRouter } from 'next/navigation';
import { PostFormDialog } from '@/components/post-form-dialog';

export function Navbar({ user = null }: { user?: User | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignout = async () => {
    const signoutUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signout`;
    toast.promise<Response>(fetch(signoutUrl, { method: 'POST' }), {
      loading: 'Signing out...',
      success: (apiRes) => {
        if (!apiRes.ok) return { message: 'Failed to sign you out' };
        router.replace('/signin');
        return {
          message: `Bye${user ? ', ' + user.username : ''}`,
          description: 'You have signed out successfully',
        };
      },
      error: (error) => ({
        message: getUnknownErrorMessage(error),
        description: 'Failed to sign you out',
      }),
    });
  };

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
            <Button type='button' {...btnCommonProps} onClick={handleSignout}>
              Sign out
            </Button>
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
