import { AxiosInstance, AxiosProgressEvent } from 'axios';
import { Image, NewImage } from '@/types';

export interface ImageFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSuccess?: (image: Image | null) => void;
  onError?: (error: unknown) => void;
  uploadingRef?: React.Ref<boolean>;
  image?: Image | null;
  label?: string;
}

export interface ImageFormServiceData {
  onError?: (error: unknown) => void;
  onSuccess?: (data: Image) => void;
  authAxios: AxiosInstance;
  newImage: NewImage;
  image: Image;
}

export type UploadImage = (
  data: Omit<ImageFormServiceData, 'image'> & {
    onUploadProgress: (e: AxiosProgressEvent) => void;
    image: ImageFormProps['image'];
    file: File;
  }
) => Promise<Image | null>;

export type UpdateImage = (data: ImageFormServiceData) => Promise<Image | null>;

export type DeleteImage = (
  data: Omit<ImageFormServiceData, 'newImage' | 'onSuccess'> & {
    onSuccess: () => void;
  }
) => Promise<void>;
