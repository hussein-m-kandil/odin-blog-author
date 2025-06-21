'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { usePathname, useRouter } from 'next/navigation';
import { cn, getUnknownErrorMessage } from '@/lib/utils';
import { CreatePostDialog } from '@/components/create-post-dialog';

export function Navbar({ user = null }: { user?: User | null }) {
  const navContainerRef = React.useRef<HTMLDivElement>(null);

  const [yScroll, setYScroll] = React.useState(0);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const navContainer = navContainerRef.current;
    if (navContainer && navContainer.firstElementChild) {
      const nav = navContainer.firstElementChild;
      const navHeight = nav.getBoundingClientRect().height;
      const eventName = 'scroll';
      const handleScroll = () => {
        const currentYScroll = window.scrollY;
        setYScroll(currentYScroll);
        if (currentYScroll < yScroll) {
          nav.classList.remove('-translate-y-100');
          if (currentYScroll > navHeight * 0.75) {
            navContainer.setAttribute('style', `padding-top: ${navHeight}px;`);
            nav.classList.add('fixed');
          } else {
            navContainer.removeAttribute('style');
            nav.classList.remove('fixed');
          }
        } else if (currentYScroll > navHeight) {
          nav.classList.add('-translate-y-100');
        }
      };
      window.addEventListener(eventName, handleScroll);
      return () => window.removeEventListener(eventName, handleScroll);
    }
  }, [yScroll]);

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
    <div ref={navContainerRef}>
      <nav
        className={cn(
          'transition-transform duration-700 motion-reduce:transition-none motion-reduce:translate-y-0',
          'flex flex-col sm:flex-row items-center justify-between gap-4 p-4 shadow-sm shadow-secondary',
          'top-0 left-0 bottom-auto w-full bg-background/85 backdrop-blur-xs'
        )}>
        <div className='text-3xl font-normal'>
          <Link href='/'>{process.env.NEXT_PUBLIC_APP_NAME}</Link>
        </div>
        <div className='flex items-center gap-2'>
          {user ? (
            <>
              <CreatePostDialog />
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
    </div>
  );
}

export default Navbar;
