import React from 'react';
import { ImageForm, ImageFormProps } from '@/components/image-form';
import { useAuthData } from '@/contexts/auth-context';
import { QueryError } from '@/components/query-error';
import { Button } from '@/components/ui/button';
import { PanelLeftClose } from 'lucide-react';
import { AuthResData } from '@/types';

type Avatar = ImageFormProps['image'];

export function AvatarForm({
  initAvatar = null,
  onClose,
}: {
  initAvatar?: Avatar;
  onClose?: () => void;
}) {
  const [avatar, setAvatar] = React.useState<Avatar>(initAvatar);
  const [errorMessage, setErrorMessage] = React.useState('');
  const { authData, signin, signout } = useAuthData();

  const { authAxios, user } = authData;

  const updateAvatarInAuthData: ImageFormProps['onSuccess'] = (image) => {
    if (user && authData.token) {
      signin({
        ...authData,
        token: authData.token,
        user: { ...user, avatar: image ? { image } : null },
      });
    } else {
      signout();
    }
  };

  const saveAvatar: ImageFormProps['onSuccess'] = (image) => {
    setAvatar(image);
    if (!user) return signout();
    if (!image) return updateAvatarInAuthData(null);
    authAxios
      .patch<AuthResData>(`/users/${user.id}`, {
        avatar: image?.id,
      })
      .then(({ data }) => {
        setErrorMessage('');
        signin(data);
        onClose?.();
      })
      .catch(() => {
        updateAvatarInAuthData(image);
        setErrorMessage('Could not save your uploaded avatar');
      });
  };

  return (
    <div>
      {errorMessage && (
        <QueryError
          onRefetch={() => saveAvatar(avatar || null)}
          className='text-center flex flex-wrap justify-center gap-x-2'>
          {errorMessage}
        </QueryError>
      )}
      <ImageForm image={avatar} label='Avatar' onSuccess={saveAvatar} />
      {onClose && (
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={onClose}>
          <PanelLeftClose /> Close
        </Button>
      )}
    </div>
  );
}

export default AvatarForm;
