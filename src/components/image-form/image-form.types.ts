import { AxiosInstance, AxiosProgressEvent } from 'axios';
import { Image, NewImage } from '@/types';

export interface ImageFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSuccess?: (image: Image | null) => void;
  onError?: (error: unknown) => void;
  submittingRef?: React.Ref<boolean>;
  image?: Image | null;
  isAvatar?: boolean;
  label?: string;
}

export interface ImageFormServiceData {
  onError?: (error: unknown) => void;
  onSuccess?: (data: Image) => void;
  authAxios: AxiosInstance;
  userid?: string | null;
  newImage: NewImage;
  image: Image;
}

export type UploadImage = (
  data: Omit<ImageFormServiceData, 'image'> & {
    onUploadProgress: (e: AxiosProgressEvent) => void;
    image: ImageFormProps['image'];
    imageFile: File;
  }
) => Promise<Image | null>;

export type UpdateImage = (data: ImageFormServiceData) => Promise<Image | null>;

export type DeleteImage = (
  data: Omit<ImageFormServiceData, 'newImage' | 'onSuccess' | 'userid'> & {
    onSuccess: () => void;
  }
) => Promise<void>;
