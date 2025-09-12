'use client';

import React from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Home, LogIn, UserPlus, UserIcon, PencilLine } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { usePostFormDialog } from '@/hooks/use-post-form-dialog';
import { useAuthData } from '@/contexts/auth-context';
import { UserAvatar } from '@/components/user-avatar';
import { ModeToggle } from '@/components/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { SignoutButton } from '../signout-button';
import { Button } from '@/components/ui/button';
import { Large } from '@/components/typography';

function CustomMenuItem({ children }: React.PropsWithChildren) {
  return <DropdownMenuItem asChild>{children}</DropdownMenuItem>;
}

export function Navbar() {
  const [visible, setVisible] = React.useState(true);
  const { showPostForm } = usePostFormDialog();
  const { authData } = useAuthData();
  const { user } = authData;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollYRef = React.useRef(0);

  React.useEffect(() => {
    let handlingAllowed = true;
    const allowHandling = () => (handlingAllowed = true);
    const handleScroll = () => {
      const newScrollY = Math.round(window.scrollY);
      const { clientHeight, scrollHeight } = document.documentElement;
      const notDocumentOverScrolled = newScrollY <= scrollHeight - clientHeight;
      const navHeight = containerRef.current?.offsetHeight || 0;
      if (handlingAllowed && notDocumentOverScrolled && navHeight) {
        setVisible(newScrollY < navHeight || newScrollY < scrollYRef.current);
        scrollYRef.current = newScrollY;
        handlingAllowed = false;
      }
    };
    window.addEventListener('scroll', handleScroll);
    const intervalId = window.setInterval(allowHandling, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearInterval(intervalId);
    };
  }, []);

  const btnProps: React.ComponentProps<'button'> = {
    className: 'inline-flex items-center gap-1',
    type: 'button',
  };

  return (
    <div ref={containerRef} className='pb-16 max-[332px]:pb-28'>
      <MotionConfig transition={{ duration: 0.35 }}>
        <AnimatePresence>
          {visible && (
            <motion.nav
              exit={{ translateY: '-100%' }}
              animate={{ translateY: '0%' }}
              initial={{ translateY: containerRef.current ? '-100%' : '0%' }}
              className='fixed top-0 left-0 bottom-auto w-full z-50 bg-background/85 backdrop-blur-xs shadow-sm shadow-secondary'>
              <div className='container p-4 mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4 max-[332px]:*:mx-auto'>
                <Large className='text-2xl'>
                  <Link href='/'>{process.env.NEXT_PUBLIC_APP_NAME}</Link>
                </Large>
                <div className='flex items-center gap-2 h-8'>
                  <ModeToggle triggerProps={{ className: 'rounded-full' }} />
                  <Separator orientation='vertical' />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild aria-label='Open user options'>
                      <Button
                        variant='outline'
                        size='icon'
                        className='rounded-full'>
                        <UserAvatar user={user} className='size-9' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='end'
                      aria-label='User options menu'
                      className='*:w-full *:text-start'>
                      {user ? (
                        <>
                          <CustomMenuItem>
                            <button {...btnProps} onClick={showPostForm}>
                              <PencilLine /> New Post
                            </button>
                          </CustomMenuItem>
                          <CustomMenuItem>
                            <Link href={`/profile/${user.username}`}>
                              <UserIcon /> Profile
                            </Link>
                          </CustomMenuItem>
                          <CustomMenuItem>
                            <Link href='/'>
                              <Home /> Home
                            </Link>
                          </CustomMenuItem>
                          <DropdownMenuSeparator />
                          <CustomMenuItem>
                            <SignoutButton {...btnProps} />
                          </CustomMenuItem>
                        </>
                      ) : (
                        <>
                          <CustomMenuItem>
                            <Link href='/signup'>
                              <UserPlus /> Sign up
                            </Link>
                          </CustomMenuItem>
                          <CustomMenuItem>
                            <Link href='/signin'>
                              <LogIn />
                              Sign in
                            </Link>
                          </CustomMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}

export default Navbar;
