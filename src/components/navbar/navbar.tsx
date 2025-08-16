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
import {
  Home,
  LogIn,
  LogOut,
  UserPlus,
  UserIcon,
  PenSquare,
} from 'lucide-react';
import { cn, getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { useDialog } from '@/contexts/dialog-context/';
import { useAuthData } from '@/contexts/auth-context';
import { UserAvatar } from '@/components/user-avatar';
import { ModeToggle } from '@/components/mode-toggle';
import { Separator } from '@/components/ui/separator';
import { PostForm } from '@/components/post-form';
import { Button } from '@/components/ui/button';
import { Large } from '@/components/typography';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function CustomMenuItem({ children }: React.PropsWithChildren) {
  return <DropdownMenuItem asChild>{children}</DropdownMenuItem>;
}

export function Navbar() {
  const navContainerRef = React.useRef<HTMLDivElement>(null);

  const { authData, signout } = useAuthData();

  const { user, authAxios } = authData;

  const [yScroll, setYScroll] = React.useState(0);
  const { showDialog, hideDialog } = useDialog();
  const router = useRouter();
  const id = React.useId();

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
    const signoutUrl = `${authData.authUrl}/signout`;
    toast.promise(authAxios.post(signoutUrl, null, { baseURL: '' }), {
      loading: 'Signing out...',
      success: () => {
        signout();
        router.replace('/signin');
        return {
          message: `Bye${user ? ', ' + user.username : ''}`,
          description: 'You have signed out successfully',
        };
      },
      error: (error) => ({
        message:
          parseAxiosAPIError(error).message || getUnknownErrorMessage(error),
        description: 'Failed to sign you out',
      }),
    });
  };

  const shouldUnmountPostFormRef = React.useRef<() => Promise<boolean>>(null);

  const postFormProps = {
    'aria-labelledby': `create-post-form-${id}`,
    shouldUnmountRef: shouldUnmountPostFormRef,
    onSuccess: hideDialog,
    title: 'Create Post',
  };

  const showPostFormDialog = () => {
    showDialog(
      {
        title: (
          <span id={postFormProps['aria-labelledby']}>
            {postFormProps.title}
          </span>
        ),
        description: 'Use the following form to create a new post.',
        body: <PostForm {...postFormProps} />,
      },
      () => {
        const shouldUnmount = shouldUnmountPostFormRef.current;
        if (shouldUnmount) return shouldUnmount();
        return true;
      }
    );
  };

  const btnProps: React.ComponentProps<'button'> = {
    className: 'inline-flex items-center gap-1',
    type: 'button',
  };

  return (
    <div ref={navContainerRef}>
      <nav
        className={cn(
          'top-0 left-0 bottom-auto w-full bg-background/85 backdrop-blur-xs shadow-sm shadow-secondary',
          'transition-transform duration-700 motion-reduce:transition-none motion-reduce:translate-y-0',
          'z-50'
        )}>
        <div className='container p-4 mx-auto flex flex-wrap items-center justify-between max-[350px]:justify-center gap-y-2 gap-x-4'>
          <Large className='text-2xl'>
            <Link href='/'>{process.env.NEXT_PUBLIC_APP_NAME}</Link>
          </Large>
          <div className='flex items-center gap-2 h-8'>
            <ModeToggle triggerProps={{ className: 'rounded-full' }} />
            <Separator orientation='vertical' />
            <DropdownMenu>
              <DropdownMenuTrigger asChild aria-label='Open user options'>
                <Button variant='outline' size='icon' className='rounded-full'>
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
                      <button
                        {...btnProps}
                        title={postFormProps.title}
                        onClick={showPostFormDialog}>
                        <PenSquare /> New Post
                      </button>
                    </CustomMenuItem>
                    <CustomMenuItem>
                      <Link href='/profile'>
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
                      <button
                        {...btnProps}
                        onClick={handleSignout}
                        className={cn(btnProps.className, 'text-destructive!')}>
                        <LogOut /> Sign out
                      </button>
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
      </nav>
    </div>
  );
}

export default Navbar;
