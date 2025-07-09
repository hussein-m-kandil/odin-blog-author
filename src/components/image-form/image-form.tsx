'use client';

import React from 'react';
import {
  cn,
  getResErrorMessageOrThrow,
  getUnknownErrorMessage,
} from '@/lib/utils';
import { MutableImage } from '@/components/mutable-image';
import { useAuthData } from '@/contexts/auth-context';
import { ImageFormProps } from './image-form.types';
import { Button } from '@/components/ui/button';
import { Loader, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image as ImageType } from '@/types';
import { toast } from 'sonner';

export function ImageForm({
  image,
  onFailed,
  onSuccess,
  className,
  ...props
}: ImageFormProps) {
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>();

  const { authData } = useAuthData();

  const baseUrl = `${authData.backendUrl}/images`;
  const updating = !!image;

  let url, method, verb;
  if (updating) {
    url = `${baseUrl}/${image.id}`;
    verb = 'Update';
    method = 'PUT';
  } else {
    url = baseUrl;
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
        const apiRes = await fetch(url, {
          headers: { Authorization: authData.token || '' },
          method,
          body,
        });
        if (!apiRes.ok) {
          const description = await getResErrorMessageOrThrow(apiRes);
          toast.error('Upload failed', { description });
        } else {
          const data = await apiRes.json();
          (e.target as HTMLFormElement).reset();
          setFile(null);
          toast.success('Upload succeeded', {
            description: 'Your image have been uploaded successfully',
          });
          onSuccess?.(data);
        }
      } catch (error) {
        toast.error('Upload failed');
        onFailed?.(error);
      } finally {
        setUploading(false);
      }
    } else {
      const description = 'Choose an image to upload';
      toast.error('Image file is missing', { description });
    }
  };

  const updateImageData = async ({ id, ...imageData }: ImageType) => {
    toast.promise<Response>(
      fetch(`${baseUrl}/${id}`, {
        headers: {
          Authorization: authData.token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
        method: 'PUT',
      }),
      {
        loading: 'Updating image data...',
        success: async (apiRes) => {
          if (!apiRes.ok) {
            return {
              message: 'Update failed',
              description: await getResErrorMessageOrThrow(apiRes),
            };
          }
          const updatedImage = (await apiRes.json()) as ImageType;
          onSuccess?.(updatedImage);
          return {
            message: 'Update succeeded',
            description: 'Your image have been updated successfully',
          };
        },
        error: (error) => {
          onFailed?.(error);
          return {
            message: 'Update failed',
            description: getUnknownErrorMessage(error),
          };
        },
      }
    );
  };

  const deleteImage = async ({ id }: ImageType) => {
    toast.promise<Response>(
      fetch(`${baseUrl}/${id}`, {
        headers: { Authorization: authData.token || '' },
        method: 'DELETE',
      }),
      {
        loading: 'Deleting image...',
        success: async (apiRes) => {
          if (!apiRes.ok) {
            return {
              message: 'Delete failed',
              description: await getResErrorMessageOrThrow(apiRes),
            };
          }
          onSuccess?.(null);
          return {
            message: 'Delete succeeded',
            description: 'Your image have been deleted successfully',
          };
        },
        error: (error) => {
          onFailed?.(error);
          return {
            message: 'Delete failed',
            description: getUnknownErrorMessage(error),
          };
        },
      }
    );
  };

  return (
    <form
      {...props}
      onSubmit={handleSubmit}
      aria-label={`${verb} image`}
      className={cn('w-full my-4', className)}>
      <Label id='upload-image-label' htmlFor='image'>
        Image
      </Label>
      <MutableImage
        mutation={{ update: updateImageData, delete: deleteImage }}
        image={image}
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
