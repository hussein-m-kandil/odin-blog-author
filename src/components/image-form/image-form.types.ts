import { AxiosInstance, AxiosProgressEvent } from 'axios';
import { Image, NewImage } from '@/types';

export interface ImageFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onClose?: () => void;
  onError?: (error: unknown) => void;
  onSuccess?: (image: Image | null) => void;
  submittingRef?: React.Ref<boolean>;
  initImage?: Image | null;
  initLabel?: string;
  isAvatar?: boolean;
}

export interface ImageFormServiceData {
  onError?: (error: unknown) => void;
  onSuccess?: (data: Image) => void;
  authAxios: AxiosInstance;
  isAvatar?: boolean;
  newImage: NewImage;
  image: Image;
}

export type UploadImage = (
  data: Omit<ImageFormServiceData, 'image'> & {
    onUploadProgress: (e: AxiosProgressEvent) => void;
    initImage: ImageFormProps['initImage'];
    imageFile: File;
  }
) => Promise<Image | null>;

export type UpdateImage = (data: ImageFormServiceData) => Promise<Image | null>;

export type DeleteImage = (
  data: Omit<ImageFormServiceData, 'newImage' | 'onSuccess' | 'isAvatar'> & {
    onSuccess: () => void;
  }
) => Promise<void>;
