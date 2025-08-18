'use client';

import React, { ChangeEvent } from 'react';
import { cn, parseAxiosAPIError, getUnknownErrorMessage } from '@/lib/utils';
import { MutableImage, MutableImageSkeleton } from '@/components/mutable-image';
import { Image as ImageType, NewImage } from '@/types';
import { useAuthData } from '@/contexts/auth-context';
import { ImageFormProps } from './image-form.types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';

export function ImageForm({
  label = 'Image',
  uploadingRef,
  className,
  onSuccess,
  onFailed,
  image,
  ...props
}: ImageFormProps) {
  const [newImage, setNewImage] = React.useState<NewImage | null>(null);
  const [uploadPercent, setUploadPercent] = React.useState(-1);
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>();

  const {
    authData: { authAxios },
  } = useAuthData();

  const fileInpRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(uploadingRef, () => uploading, [uploading]);

  const setNewImageData = (selectedFile: File) => {
    setFile(selectedFile);
    if (newImage) URL.revokeObjectURL(newImage.src);
    const src = URL.createObjectURL(selectedFile);
    setNewImage({ yPos: 50, xPos: 50, info: '', alt: '', src });
  };

  const resetNewImageData = () => {
    if (fileInpRef.current) fileInpRef.current.value = '';
    if (newImage) URL.revokeObjectURL(newImage.src);
    setNewImage(null);
    setFile(null);
  };

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
        if (newImage) {
          const newImageEntries = Object.entries(newImage);
          for (const [k, v] of newImageEntries) {
            body.set(k, v);
          }
          body.delete('src');
        }
        const { data } = await authAxios[method]<ImageType>(url, body, {
          onUploadProgress: ({ loaded, total }) => {
            if (loaded && total) {
              const intProgressPercent = Math.floor((loaded / total) * 100);
              const newUploadPercent = (intProgressPercent % 100) - 1;
              setUploadPercent(newUploadPercent);
            }
          },
        });
        resetNewImageData();
        (e.target as HTMLFormElement).reset();
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

  const updateImageData = async ({ id, ...imageData }: NewImage) => {
    if (id) {
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
    } else {
      setNewImage(imageData);
    }
  };

  const deleteImage = async ({ id }: NewImage) => {
    if (id) {
      toast.promise<AxiosResponse>(
        authAxios.delete<null>(`${endpoint}/${id}`),
        {
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
        }
      );
    } else {
      resetNewImageData();
    }
  };

  const handleFileChange: React.EventHandler<ChangeEvent<HTMLInputElement>> = (
    e
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setNewImageData(selectedFile);
      } else {
        resetNewImageData();
        toast.error('Please select a valid image file!');
      }
    }
  };

  return (
    <form
      {...props}
      onSubmit={handleSubmit}
      aria-label={`${verb} image`}
      className={cn('w-full my-4 space-y-2', className)}>
      <Label htmlFor='image'>{label}</Label>
      <div className='relative'>
        {uploading ? (
          <MutableImageSkeleton />
        ) : (
          <MutableImage
            image={newImage || image}
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
      <Input
        id='image'
        type='file'
        name='image'
        accept='image/*'
        ref={fileInpRef}
        disabled={uploading}
        onChange={handleFileChange}
      />
      <Button type='submit' className='w-full' disabled={!file || uploading}>
        {uploading ? (
          <Loader
            aria-label='Uploading'
            className='inline-block animate-spin'
          />
        ) : (
          <Upload className='inline-block' />
        )}
        <span>
          {verb} {label.toLowerCase()}
        </span>
      </Button>
    </form>
  );
}

export default ImageForm;
