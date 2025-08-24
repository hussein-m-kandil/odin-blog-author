import React from 'react';
import { getNewImageDataFromImage, isNewImageHasUpdates } from '@/lib/utils';
import { ImageInputState, ImageInputProps } from './image-input.types';
import { AxiosProgressEvent } from 'axios';
import { Image, NewImage } from '@/types';

export const useImageInputState = (image?: ImageInputProps['image']) => {
  const [newImage, setNewImage] = React.useState<NewImage | null>(
    image ? getNewImageDataFromImage(image) : null
  );
  const [imageFile, setFile] = React.useState<File | null>(null);
  const [uploadPercent, setUploadPercent] = React.useState(-1);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      if (imageFile && newImage) URL.revokeObjectURL(newImage.src);
    };
  }, [imageFile, newImage]);

  const applyNewImage = React.useCallback(
    (selectedFile: File) => {
      setFile(selectedFile);
      if (newImage) URL.revokeObjectURL(newImage.src);
      const src = URL.createObjectURL(selectedFile);
      setNewImage({ yPos: 50, xPos: 50, info: '', alt: '', src });
    },
    [newImage]
  );

  const clearNewImage = React.useCallback(
    (prevImage?: Image | null) => {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setNewImage(prevImage ? getNewImageDataFromImage(prevImage) : null);
      if (newImage) URL.revokeObjectURL(newImage.src);
    },
    [newImage]
  );

  const handleUploadProgress: (e: AxiosProgressEvent) => void = ({
    loaded,
    total,
  }) => {
    if (loaded && total) {
      const intProgressPercent = Math.floor((loaded / total) * 100);
      const newUploadPercent = (intProgressPercent % 100) - 1;
      setUploadPercent(newUploadPercent);
    }
  };

  return {
    handleUploadProgress,
    applyNewImage,
    clearNewImage,
    setNewImage,
    fileInputRef,
    uploadPercent,
    ...getImageState({ image, newImage, imageFile }),
  };
};

const getImageState = ({
  image,
  newImage,
  imageFile,
}: Pick<
  ImageInputProps,
  'image' | 'newImage' | 'imageFile'
>): ImageInputState => {
  const shouldDelete = !!image && !newImage;
  const shouldUpload = !!imageFile && !!newImage;
  const shouldUpdate =
    !imageFile &&
    !!newImage &&
    !!image &&
    isNewImageHasUpdates(image, newImage);
  if (shouldUpload) {
    return {
      shouldDelete: false,
      shouldUpdate: false,
      mode: 'upload',
      shouldUpload,
      imageFile,
      newImage,
      image,
    };
  } else if (shouldUpdate) {
    return {
      shouldDelete: false,
      shouldUpload: false,
      mode: 'update',
      shouldUpdate,
      imageFile,
      newImage,
      image,
    };
  } else if (shouldDelete) {
    return {
      shouldUpload: false,
      shouldUpdate: false,
      mode: 'delete',
      shouldDelete,
      imageFile,
      newImage,
      image,
    };
  }
  return {
    shouldUpload: false,
    shouldUpdate: false,
    shouldDelete: false,
    mode: 'idle',
    imageFile,
    newImage,
    image,
  };
};
