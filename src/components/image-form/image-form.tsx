'use client';

import React from 'react';
import { cn, getResErrorMessageOrThrow } from '@/lib/utils';
import { Image as ImageType } from '@/types';
import { Loader, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthData } from '@/contexts/auth-context';
import { MutableImage } from '@/components/mutable-image';

const uploadError = 'Upload failed';
const baseEndpoint = '/images';

export function ImageForm({
  image,
  onSuccess,
  onFailed,
  className,
  ...formProps
}: Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  onSuccess?: (image: ImageType) => void;
  onFailed?: (error: unknown) => void;
  image?: ImageType | null;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>();

  const { authData } = useAuthData();

  const isUpdate = !!image;

  let endpoint, method, verb;
  if (isUpdate) {
    endpoint = `${baseEndpoint}/${image.id}`;
    verb = 'Update';
    method = 'PUT';
  } else {
    endpoint = baseEndpoint;
    verb = 'Upload';
    method = 'POST';
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (file) {
      try {
        setUploading(true);
        const body = new FormData();
        body.set('image', file);
        const apiRes = await fetch(`${authData.backendUrl}${endpoint}`, {
          headers: { Authorization: authData.token || '' },
          method,
          body,
        });
        if (!apiRes.ok) {
          const description = await getResErrorMessageOrThrow(apiRes);
          toast.error(uploadError, { description });
        } else {
          const data = await apiRes.json();
          (e.target as HTMLFormElement).reset();
          setFile(null);
          toast.success('Successful upload', {
            description: 'You image have been uploaded successfully',
          });
          onSuccess?.(data);
        }
      } catch (error) {
        toast.error(uploadError);
        onFailed?.(error);
      } finally {
        setUploading(false);
      }
    } else {
      const description = 'Choose an image to upload';
      toast.error('Image file is missing', { description });
    }
  };

  // TODO: An image should have a name to be used in the `alt` attribute

  return (
    <form
      {...formProps}
      onSubmit={handleSubmit}
      aria-label={`${verb} image`}
      className={cn('w-full my-4', className)}>
      <Label id='upload-image-label' htmlFor='image'>
        Image
      </Label>
      <MutableImage
        image={{
          id: '21349437-5093-4ac8-bd66-831e88e4e5cf',
          ownerId: '928d45dd-d3f8-470e-83f2-80779c13b02c',
          createdAt: '2025-07-04T14:02:49.817Z',
          updatedAt: '2025-07-04T14:02:49.817Z',
          info: '',
          alt: '',
          src: 'https://ndauvqaezozccgtddhkr.supabase.co/storage/v1/object/public/images/public/superman/928d45dd-d3f8-470e-83f2-80779c13b02c-56892855.jpg',
          mimetype: 'image/jpeg',
          size: 790779,
          width: 1024,
          height: 1024,
          xPos: 0,
          yPos: 0,
          scale: 1,
          owner: {
            id: '928d45dd-d3f8-470e-83f2-80779c13b02c',
            fullname: 'Clark Kent / Kal-El',
            username: 'superman',
            isAdmin: false,
            createdAt: '2025-07-04T08:42:24.278Z',
            updatedAt: '2025-07-04T08:42:24.278Z',
            bio: null,
          },
        }}
      />
      <div className='mt-2 flex justify-between space-x-2'>
        <Input
          id='image'
          type='file'
          name='image'
          disabled={uploading}
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <Button size='icon' type='submit' disabled={!file || uploading}>
          {uploading ? (
            <Loader className='inline-block animate-spin' />
          ) : (
            <Upload className='inline-block' />
          )}
          <span className='sr-only'>{verb}</span>
        </Button>
      </div>
    </form>
  );
}

export default ImageForm;
