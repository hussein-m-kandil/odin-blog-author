'use client';

import React from 'react';
import {
  UploadImage,
  UpdateImage,
  DeleteImage,
  ImageFormProps,
} from './image-form.types';
import { cn, parseAxiosAPIError, getUnknownErrorMessage } from '@/lib/utils';
import { uploadImage, updateImage, deleteImage } from './image-form.services';
import { Loader, ImageUp, ImagePlus, ImageMinus } from 'lucide-react';
import { ImageInput, useImageInputState } from '../image-input';
import { useAuthData } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Image, NewImage } from '@/types';
import { toast } from 'sonner';

export function ImageForm({
  label = 'Image',
  submittingRef,
  className,
  image: initImage,
  onError,
  onSuccess,
  ...props
}: ImageFormProps) {
  const [submitting, setSubmitting] = React.useState(false);

  React.useImperativeHandle(submittingRef, () => submitting, [submitting]);

  const {
    authData: { authAxios },
  } = useAuthData();

  const {
    handleUploadProgress,
    refreshNewImageUrl,
    applyNewImage,
    clearNewImage,
    setNewImage,
    mode,
    image,
    newImage,
    imageFile,
    shouldDelete,
    shouldUpdate,
    shouldUpload,
    fileInputRef,
    uploadPercent,
  } = useImageInputState(initImage);

  const getUploadData = (baseData: {
    newImage: NewImage;
    imageFile: File;
  }): Parameters<UploadImage>['0'] => {
    return {
      ...baseData,
      image,
      authAxios,
      onUploadProgress: handleUploadProgress,
      onSuccess: (uploadedImage) => {
        clearNewImage(uploadedImage);
        toast.success('Upload succeeded', {
          description: 'Your image have been uploaded successfully',
        });
        onSuccess?.(uploadedImage);
      },
      onError: (error) => {
        refreshNewImageUrl();
        toast.error('Upload failed', {
          description:
            parseAxiosAPIError(error).message || getUnknownErrorMessage(error),
          duration: Infinity,
        });
        onError?.(error);
      },
    };
  };

  const getUpdateData = (baseData: {
    image: Image;
    newImage: NewImage;
  }): Parameters<UpdateImage>['0'] => {
    return {
      ...baseData,
      authAxios,
      onSuccess: (updatedImage) => {
        clearNewImage(updatedImage);
        toast.success('Update succeeded', {
          description: 'Your image have been updated successfully',
        });
        onSuccess?.(updatedImage);
      },
      onError: (error) => {
        toast.error('Update failed', {
          description:
            parseAxiosAPIError(error).message || getUnknownErrorMessage(error),
          duration: Infinity,
        });
        onError?.(error);
      },
    };
  };

  const getDeleteData = (baseData: {
    image: Image;
  }): Parameters<DeleteImage>['0'] => {
    return {
      ...baseData,
      authAxios,
      onSuccess: () => {
        clearNewImage();
        toast.success('Delete succeeded', {
          description: 'Your image have been deleted successfully',
        });
        onSuccess?.(null);
      },
      onError: (error) => {
        toast.error('Delete failed', {
          description:
            parseAxiosAPIError(error).message || getUnknownErrorMessage(error),
          duration: Infinity,
        });
        onError?.(error);
      },
    };
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === 'upload') {
      await uploadImage(getUploadData({ imageFile, newImage }));
    } else if (mode === 'update') {
      await updateImage(getUpdateData({ image, newImage }));
    } else if (mode === 'delete') {
      await deleteImage(getDeleteData({ image }));
    } else {
      toast.warning('There are no pending changes to submit!');
    }
    setSubmitting(false);
  };

  const submitter = shouldDelete
    ? {
        idle: { icon: <ImageMinus />, label: `Delete ${label.toLowerCase()}` },
        submitting: { label: 'Deleting...' },
      }
    : initImage && !imageFile
    ? {
        idle: { icon: <ImagePlus />, label: `Update ${label.toLowerCase()}` },
        submitting: { label: 'Updating...' },
      }
    : {
        idle: { icon: <ImageUp />, label: `Upload ${label.toLowerCase()}` },
        submitting: { label: 'Uploading...' },
      };

  return (
    <form
      {...props}
      onSubmit={handleSubmit}
      aria-label={submitter.idle.label}
      className={cn('w-full my-4 space-y-2', className)}>
      <ImageInput
        ref={fileInputRef}
        newImage={newImage}
        submitting={submitting}
        uploadPercent={uploadPercent}
        clearNewImage={clearNewImage}
        applyNewImage={applyNewImage}
        setNewImage={setNewImage}
        imageFile={imageFile}
        image={image}
        label={label}
      />
      <Button
        type='submit'
        className='w-full'
        disabled={
          (!shouldUpload && !shouldUpdate && !shouldDelete) || submitting
        }>
        {submitting ? (
          <>
            <Loader aria-label='Uploading' className='animate-spin' />{' '}
            {submitter.submitting.label}
          </>
        ) : (
          <>
            {submitter.idle.icon} {submitter.idle.label}
          </>
        )}
      </Button>
    </form>
  );
}

export default ImageForm;
