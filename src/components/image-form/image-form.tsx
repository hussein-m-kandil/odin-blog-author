'use client';

import React from 'react';
import { cn, parseAxiosAPIError, getUnknownErrorMessage } from '@/lib/utils';
import { MutableImage, MutableImageSkeleton } from '@/components/mutable-image';
import { useAuthData } from '@/contexts/auth-context';
import { ImageFormProps } from './image-form.types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image as ImageType } from '@/types';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';

export function ImageForm({
  uploadingRef,
  className,
  onSuccess,
  onFailed,
  image,
  ...props
}: ImageFormProps) {
  const [uploadPercent, setUploadPercent] = React.useState(-1);
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>();

  const {
    authData: { authAxios },
  } = useAuthData();

  React.useImperativeHandle(uploadingRef, () => uploading, [uploading]);

  const endpoint = '/images';
  const updating = !!image;

  let url: string, method: 'post' | 'put', verb: 'Update' | 'Upload';
  if (updating) {
    url = `${endpoint}/${image.id}`;
    verb = 'Update';
    method = 'put';
  } else {
    url = endpoint;
    verb = 'Upload';
    method = 'post';
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (file) {
      try {
        setUploading(true);
        const body = new FormData();
        body.set('image', file);
        const { data } = await authAxios[method]<ImageType>(url, body, {
          onUploadProgress: ({ loaded, total }) => {
            if (loaded && total) {
              const intProgressPercent = Math.floor((loaded / total) * 100);
              const newUploadPercent = (intProgressPercent % 100) - 1;
              setUploadPercent(newUploadPercent);
            }
          },
        });
        (e.target as HTMLFormElement).reset();
        setFile(null);
        toast.success('Upload succeeded', {
          description: 'Your image have been uploaded successfully',
        });
        onSuccess?.(data);
      } catch (error) {
        const { message: description } = parseAxiosAPIError(error);
        toast.error('Upload failed', { description });
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
    toast.promise<AxiosResponse>(
      authAxios.put<ImageType>(`${endpoint}/${id}`, imageData),
      {
        loading: 'Updating image data...',
        success: async ({ data: updatedImage }) => {
          onSuccess?.(updatedImage);
          return {
            message: 'Update succeeded',
            description: 'Your image have been updated successfully',
          };
        },
        error: (error) => {
          const { message: description } = parseAxiosAPIError(error);
          if (description) return { message: 'Update failed', description };
          onFailed?.(error);
          return {
            description: getUnknownErrorMessage(error),
            message: 'Update failed',
          };
        },
      }
    );
  };

  const deleteImage = async ({ id }: ImageType) => {
    toast.promise<AxiosResponse>(authAxios.delete<null>(`${endpoint}/${id}`), {
      loading: 'Deleting image...',
      success: async ({ data }) => {
        onSuccess?.(data);
        return {
          message: 'Delete succeeded',
          description: 'Your image have been deleted successfully',
        };
      },
      error: (error) => {
        const { message } = parseAxiosAPIError(error);
        onFailed?.(error);
        return {
          message: 'Delete failed',
          description: message || getUnknownErrorMessage(error),
        };
      },
    });
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
      <div className='relative'>
        {uploading ? (
          <MutableImageSkeleton />
        ) : (
          <MutableImage
            image={image}
            mutation={{ update: updateImageData, delete: deleteImage }}
          />
        )}
        {uploadPercent >= 0 && (
          <Progress
            value={uploadPercent}
            className='absolute bottom-0 w-full rounded-none shadow'
          />
        )}
      </div>
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
            <Loader
              aria-label='Uploading'
              className='inline-block animate-spin'
            />
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
