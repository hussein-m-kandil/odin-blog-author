'use client';

import React from 'react';
import {
  cn,
  parseAxiosAPIError,
  getUnknownErrorMessage,
  getNewImageDataFromImage,
} from '@/lib/utils';
import { MutableImage, MutableImageSkeleton } from '@/components/mutable-image';
import { Loader, ImageUp, ImagePlus, ImageMinus } from 'lucide-react';
import { Image, Image as ImageType, NewImage } from '@/types';
import { useAuthData } from '@/contexts/auth-context';
import { ImageFormProps } from './image-form.types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  const [newImageData, setImageData] = React.useState<NewImage | null>(
    image ? getNewImageDataFromImage(image) : null
  );
  const [imageHasUpdates, setImageHasUpdates] = React.useState(false);
  const [uploadPercent, setUploadPercent] = React.useState(-1);
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>();

  const {
    authData: { authAxios },
  } = useAuthData();

  const fileInpRef = React.useRef<HTMLInputElement>(null);

  const isUpdate = !!image;
  const endpoint = '/images';
  const imageShouldBeDeleted = isUpdate && !newImageData;

  React.useImperativeHandle(uploadingRef, () => uploading, [uploading]);

  const setNewImageData = (selectedFile: File) => {
    setFile(selectedFile);
    if (newImageData) URL.revokeObjectURL(newImageData.src);
    const src = URL.createObjectURL(selectedFile);
    setImageData({ yPos: 50, xPos: 50, info: '', alt: '', src });
  };

  const resetNewImageData = () => {
    if (fileInpRef.current) fileInpRef.current.value = '';
    if (newImageData) URL.revokeObjectURL(newImageData.src);
    setImageData(null);
    setFile(null);
  };

  React.useEffect(() => {
    return () => {
      if (file && newImageData) {
        URL.revokeObjectURL(newImageData.src);
      }
    };
  }, [file, newImageData]);

  const submitUpdate = async ({ id, ...oldData }: Image, newData: NewImage) => {
    let result = null;
    try {
      setUploading(true);
      const url = `${endpoint}/${id}`;
      const body = { ...oldData, ...newData };
      const { data } = await authAxios.put<ImageType>(url, body);
      setImageHasUpdates(false);
      onSuccess?.(data);
      toast.success('Update succeeded', {
        description: 'Your image have been updated successfully',
      });
      result = data;
    } catch (error) {
      const { message } = parseAxiosAPIError(error);
      if (!message) onFailed?.(error);
      toast.error('Update failed', {
        description: message || getUnknownErrorMessage(error),
      });
    } finally {
      setUploading(false);
    }
    return result;
  };

  const submitDelete = async (id: Image['id']) => {
    let result: null | undefined;
    try {
      setUploading(true);
      const { data } = await authAxios.delete<null>(`${endpoint}/${id}`);
      onSuccess?.(data);
      toast.success('Delete succeeded', {
        description: 'Your image have been deleted successfully',
      });
      result = null;
    } catch (error) {
      onFailed?.(error);
      toast.error('Delete failed', {
        description:
          parseAxiosAPIError(error).message || getUnknownErrorMessage(error),
      });
    } finally {
      setUploading(false);
    }
    return result;
  };

  const submitImageFile = async (imageFile: File, e: React.SyntheticEvent) => {
    let result = null;
    try {
      setUploading(true);
      const body = new FormData();
      body.set('image', imageFile);
      if (newImageData) {
        const newImageEntries = Object.entries(newImageData);
        for (const [k, v] of newImageEntries) {
          body.set(k, v);
        }
        body.delete('src');
      }
      let url: string, method: 'post' | 'put';
      if (isUpdate) {
        url = `${endpoint}/${image.id}`;
        method = 'put';
      } else {
        url = endpoint;
        method = 'post';
      }
      const { data } = await authAxios<ImageType>({
        url,
        method,
        data: body,
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
      result = data;
    } catch (error) {
      const { message: description } = parseAxiosAPIError(error);
      toast.error('Upload failed', { description });
      onFailed?.(error);
    } finally {
      setUploading(false);
    }
    return result;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    let result: Image | null = null;
    if (file) {
      result = await submitImageFile(file, e);
    } else if (isUpdate) {
      if (imageShouldBeDeleted) {
        const deleteRes = await submitDelete(image.id);
        if (deleteRes !== undefined) result = deleteRes;
      } else if (imageHasUpdates && newImageData) {
        result = await submitUpdate(image, newImageData);
      } else {
        toast.warning('There are no pending changes to submit!');
      }
    } else {
      toast.error('Image file is missing');
    }
    setImageData(result ? getNewImageDataFromImage(result) : null);
  };

  const updateImage = async (data: NewImage) => {
    setImageData(data);
    setImageHasUpdates(isUpdate);
  };

  const deleteImage = async () => {
    resetNewImageData();
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

  const submitter = imageShouldBeDeleted
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
          <MutableImage
            image={newImageData}
            mutation={{ update: updateImage, delete: deleteImage }}
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
      <Button
        type='submit'
        className='w-full'
        disabled={
          (!file && !imageHasUpdates && !imageShouldBeDeleted) || uploading
        }>
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
