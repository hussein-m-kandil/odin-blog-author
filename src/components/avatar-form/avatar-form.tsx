import React from 'react';
import { ImageForm, ImageFormProps } from '@/components/image-form';
import { useAuthData } from '@/contexts/auth-context';
import { QueryError } from '@/components/query-error';
import { AuthResData } from '@/types';
import { toast } from 'sonner';

type Avatar = ImageFormProps['image'];

export function AvatarForm({ initAvatar }: { initAvatar: Avatar }) {
  const [avatar, setAvatar] = React.useState<Avatar>(initAvatar);
  const [errorMessage, setErrorMessage] = React.useState('');
  const { authData, signin, signout } = useAuthData();

  const { authAxios, user } = authData;

  const saveAvatar: ImageFormProps['onSuccess'] = (image) => {
    if (user) {
      setAvatar(image);
      authAxios
        .patch<AuthResData>(`/users/${user.id}`, {
          avatar: image?.id,
        })
        .then(({ data }) => {
          setErrorMessage('');
          signin(data);
          const verb = image ? 'updated' : 'deleted';
          const description = `Your avatar is ${verb} successfully`;
          toast.success(`Avatar ${verb}`, { description });
        })
        .catch(() => {
          if (user && authData.token) {
            signin({
              ...authData,
              token: authData.token,
              user: { ...user, avatar: image || null },
            });
          } else {
            signout();
          }
          setErrorMessage('Could not save your uploaded avatar');
        });
    } else {
      signout();
    }
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
      <ImageForm image={avatar} onSuccess={saveAvatar} />
    </div>
  );
}

export default AvatarForm;
