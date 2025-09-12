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
import { ImageInput, useImageInputState } from '@/components/image-input';
import { ImageUp, ImagePlus, ImageMinus } from 'lucide-react';
import { CloseButton } from '@/components/close-button';
import { useAuthData } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/loader';
import { Image, NewImage } from '@/types';
import { toast } from 'sonner';

export function ImageForm({
  isAvatar = false,
  submittingRef,
  initImage,
  initLabel,
  className,
  onError,
  onClose,
  onSuccess,
  ...props
}: ImageFormProps) {
  const isUpdate = !!initImage;
  const label = initLabel || (isAvatar ? 'Avatar' : 'Image');

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
      isAvatar,
      authAxios,
      initImage: image,
      onUploadProgress: handleUploadProgress,
      onSuccess: (uploadedImage) => {
        clearNewImage(uploadedImage);
        const verb = isUpdate ? 'updated' : 'uploaded';
        toast.success(`${label} ${verb}`, {
          description: `Your ${label.toLowerCase()} have been ${verb} successfully`,
        });
        onSuccess?.(uploadedImage);
      },
      onError: (error) => {
        refreshNewImageUrl();
        toast.error('Upload failed', {
          description:
            parseAxiosAPIError(error).message || getUnknownErrorMessage(error),
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
      isAvatar,
      authAxios,
      onSuccess: (updatedImage) => {
        clearNewImage(updatedImage);
        toast.success(`${label} updated`, {
          description: `Your ${label.toLowerCase()} have been updated successfully`,
        });
        onSuccess?.(updatedImage);
      },
      onError: (error) => {
        toast.error('Update failed', {
          description:
            parseAxiosAPIError(error).message || getUnknownErrorMessage(error),
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
        toast.success(`${label} deleted`, {
          description: `Your ${label.toLowerCase()} have been deleted successfully`,
        });
        onSuccess?.(null);
      },
      onError: (error) => {
        toast.error('Delete failed', {
          description:
            parseAxiosAPIError(error).message || getUnknownErrorMessage(error),
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
    : isUpdate
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
      className={cn('w-full', className)}>
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
        className='w-full mt-2 mb-4'
        disabled={
          (!shouldUpload && !shouldUpdate && !shouldDelete) || submitting
        }>
        {submitting ? (
          <>
            <Loader aria-label='Uploading' /> {submitter.submitting.label}
          </>
        ) : (
          <>
            {submitter.idle.icon} {submitter.idle.label}
          </>
        )}
      </Button>
      <CloseButton onClose={onClose} />
    </form>
  );
}

export default ImageForm;
