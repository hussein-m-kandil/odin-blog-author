'use client';

import { cn, getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { useAuthData } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function SignoutButton({
  className,
  ...props
}: Omit<React.ComponentProps<'button'>, 'onClick'>) {
  const { authData, signout } = useAuthData();
  const { user, authAxios } = authData;
  const router = useRouter();

  if (!user) {
    signout();
    router.replace('/signin');
    return null;
  }

  const handleSignout = async () => {
    const signoutUrl = `${authData.authUrl}/signout`;
    toast.promise(authAxios.post(signoutUrl, null, { baseURL: '' }), {
      loading: 'Signing out...',
      success: () => {
        signout();
        router.replace('/signin');
        return {
          message: `Bye, ${user.username}`,
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

  return (
    <button
      {...props}
      onClick={handleSignout}
      className={cn('text-destructive!', className)}>
      <LogOut /> Sign out
    </button>
  );
}

export default SignoutButton;
