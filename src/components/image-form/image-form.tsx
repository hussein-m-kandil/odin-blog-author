'use client';

import React from 'react';
import {
  cn,
  isNewImageHasUpdates,
  parseAxiosAPIError,
  getUnknownErrorMessage,
  getNewImageDataFromImage,
} from '@/lib/utils';
import {
  UploadImage,
  UpdateImage,
  DeleteImage,
  ImageFormProps,
} from './image-form.types';
import {
  MutableImage,
  MutableImageProps,
  MutableImageSkeleton,
} from '@/components/mutable-image';
import { uploadImage, updateImage, deleteImage } from './image-form.services';
import { Loader, ImageUp, ImagePlus, ImageMinus } from 'lucide-react';
import { useAuthData } from '@/contexts/auth-context';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image, NewImage } from '@/types';
import { toast } from 'sonner';

export function ImageForm({
  label = 'Image',
  uploadingRef,
  className,
  onSuccess,
  onError,
  image,
  ...props
}: ImageFormProps) {
  const [newImage, setNewImage] = React.useState<NewImage | null>(
    image ? getNewImageDataFromImage(image) : null
  );
  const [uploadPercent, setUploadPercent] = React.useState(-1);
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>();

  const {
    authData: { authAxios },
  } = useAuthData();

  const fileInpRef = React.useRef<HTMLInputElement>(null);

  const isUpdate = !!image;
  const toBeUploaded = file && newImage;
  const toBeDeleted = isUpdate && !newImage;
  const toBeUpdated =
    !file && isUpdate && newImage && isNewImageHasUpdates(image, newImage);

  React.useImperativeHandle(uploadingRef, () => uploading, [uploading]);

  React.useEffect(() => {
    return () => {
      if (toBeUploaded) {
        URL.revokeObjectURL(newImage.src);
      }
    };
  }, [toBeUploaded, newImage]);

  const setNewImageData = (selectedFile: File) => {
    setFile(selectedFile);
    if (newImage) URL.revokeObjectURL(newImage.src);
    const src = URL.createObjectURL(selectedFile);
    setNewImage({ yPos: 50, xPos: 50, info: '', alt: '', src });
  };

  const resetNewImageData = (prevImage?: Image | null) => {
    setFile(null);
    if (fileInpRef.current) fileInpRef.current.value = '';
    setNewImage(prevImage ? getNewImageDataFromImage(prevImage) : null);
    if (newImage) URL.revokeObjectURL(newImage.src);
  };

  const handleUploadProgress: Parameters<UploadImage>['0']['onUploadProgress'] =
    ({ loaded, total }) => {
      if (loaded && total) {
        const intProgressPercent = Math.floor((loaded / total) * 100);
        const newUploadPercent = (intProgressPercent % 100) - 1;
        setUploadPercent(newUploadPercent);
      }
    };

  const getUploadData = (baseData: {
    file: File;
    newImage: NewImage;
  }): Parameters<UploadImage>['0'] => {
    return {
      ...baseData,
      image,
      authAxios,
      onUploadProgress: handleUploadProgress,
      onSuccess: (uploadedImage) => {
        resetNewImageData(uploadedImage);
        toast.success('Upload succeeded', {
          description: 'Your image have been uploaded successfully',
        });
        onSuccess?.(uploadedImage);
      },
      onError: (error) => {
        const { message: description } = parseAxiosAPIError(error);
        toast.error('Upload failed', { description });
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
        resetNewImageData(updatedImage);
        toast.success('Update succeeded', {
          description: 'Your image have been updated successfully',
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
        resetNewImageData();
        toast.success('Delete succeeded', {
          description: 'Your image have been deleted successfully',
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
    setUploading(true);
    if (toBeUploaded) {
      await uploadImage(getUploadData({ file, newImage }));
    } else if (toBeUpdated) {
      await updateImage(getUpdateData({ image, newImage }));
    } else if (toBeDeleted) {
      await deleteImage(getDeleteData({ image }));
    } else {
      toast.warning('There are no pending changes to submit!');
    }
    setUploading(false);
  };

  const handleFileChange: React.EventHandler<
    React.ChangeEvent<HTMLInputElement>
  > = (e) => {
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

  const imageMutation: MutableImageProps['mutation'] =
    image || newImage
      ? {
          update: (data) => newImage && setNewImage({ ...newImage, ...data }),
          delete: () => resetNewImageData(file ? image : null),
          reset: () => {
            if (file) setNewImageData(file);
            else resetNewImageData(image);
          },
        }
      : null;

  const submitter = toBeDeleted
    ? {
        idle: { icon: <ImageMinus />, label: `Delete ${label.toLowerCase()}` },
        submitting: { label: 'Deleting...' },
      }
    : isUpdate && !file
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
      <Label htmlFor='image'>{label}</Label>
      <div className='relative'>
        {uploading ? (
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
        id='image'
        type='file'
        name='image'
        accept='image/*'
        ref={fileInpRef}
        disabled={uploading}
        onChange={handleFileChange}
      />
      <Button
        type='submit'
        className='w-full'
        disabled={(!toBeUploaded && !toBeUpdated && !toBeDeleted) || uploading}>
        {uploading ? (
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
