'use client';

import React from 'react';
import { cn, getUnknownErrorMessage, parseAxiosAPIError } from '@/lib/utils';
import { useAuthData } from '@/contexts/auth-context';
import { DeleteForm } from '@/components/delete-form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function DeleteProfileForm({
  onSuccess,
  className,
  ...deleteFormProps
}: Omit<
  React.ComponentProps<typeof DeleteForm>,
  'subject' | 'errorMessage' | 'deleting' | 'onDelete'
> & {
  onSuccess?: () => void;
}) {
  const {
    authData: { authAxios },
  } = useAuthData();
  const [errorMessage, setErrorMessage] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  const router = useRouter();

  const usernameInputRef = React.useRef<HTMLInputElement>(null);

  const {
    authData: { user: owner },
    signout,
  } = useAuthData();

  if (!owner) {
    router.replace('/', { scroll: true });
    return;
  }

  const deleteProfile = async () => {
    const usernameInput = usernameInputRef.current;
    if (usernameInput) {
      if (usernameInput.value !== owner.username) {
        setErrorMessage(
          `Your username is ${usernameInput.value ? 'wrong' : 'required'}`
        );
        usernameInput.ariaInvalid = 'true';
      } else {
        try {
          setErrorMessage('');
          setDeleting(true);
          await authAxios.delete(`/users/${owner.id}`);
          signout();
          onSuccess?.();
          router.push('/', { scroll: true });
          toast.success('Profile deleted', {
            description: 'You have deleted your profile successfully',
          });
        } catch (error) {
          setErrorMessage(
            parseAxiosAPIError(error).message || getUnknownErrorMessage(error)
          );
        } finally {
          setDeleting(false);
        }
      }
    } else {
      setErrorMessage('Something wrong');
    }
  };

  return (
    <DeleteForm
      {...deleteFormProps}
      deleting={deleting}
      subject='your profile'
      onDelete={deleteProfile}
      errorMessage={errorMessage}
      className={cn('my-4', className)}>
      <div className='space-y-4'>
        <p>Please enter your username to confirm the deletion.</p>
        <Input
          type='text'
          name='username'
          autoComplete='off'
          aria-label='Username'
          ref={usernameInputRef}
          onChange={(e) => {
            e.target.ariaInvalid = 'false';
            setErrorMessage('');
          }}
        />
      </div>
    </DeleteForm>
  );
}

export default DeleteProfileForm;
