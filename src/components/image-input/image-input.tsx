'use client';

import React from 'react';
import {
  MutableImage,
  MutableImageProps,
  MutableImageSkeleton,
} from '@/components/mutable-image';
import { ImageInputProps } from './image-input.types';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ImageInput({
  containerClassName,
  label = 'Image',
  containerProps,
  uploadPercent,
  applyNewImage,
  clearNewImage,
  setNewImage,
  submitting,
  imageFile,
  newImage,
  image,
  ref,
  className,
  ...props
}: ImageInputProps) {
  const handleFileChange: React.EventHandler<
    React.ChangeEvent<HTMLInputElement>
  > = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        applyNewImage(selectedFile);
      } else {
        clearNewImage();
        toast.error('Please select a valid image file!');
      }
    }
  };

  const imageMutation: MutableImageProps['mutation'] =
    image || newImage
      ? {
          update: (data) => newImage && setNewImage({ ...newImage, ...data }),
          delete: () => clearNewImage(imageFile ? image : null),
          reset: () => {
            if (imageFile) applyNewImage(imageFile);
            else clearNewImage(image);
          },
        }
      : null;

  return (
    <div {...containerProps} className={cn('w-full', containerClassName)}>
      <Label htmlFor='image'>{label}</Label>
      <div className='relative'>
        {submitting ? (
          <MutableImageSkeleton />
        ) : (
          <MutableImage image={newImage} mutation={imageMutation} />
        )}
        {uploadPercent >= 0 && (
          <Progress
            value={uploadPercent}
            className='absolute bottom-0 w-full rounded-none shadow'
          />
        )}
      </div>
      <Input
        {...props}
        ref={ref}
        id='image'
        type='file'
        name='image'
        accept='image/*'
        disabled={submitting}
        className={className}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default ImageInput;
