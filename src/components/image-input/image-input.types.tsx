import { Image, NewImage } from '@/types';

export interface ImageInputProps extends React.ComponentProps<'input'> {
  label?: string;
  submitting: boolean;
  uploadPercent: number;
  ref?: React.Ref<HTMLInputElement | null>;
  setNewImage: (newImage: NewImage) => void;
  applyNewImage: (selectedFile: File) => void;
  clearNewImage: (prevImage?: Image | null) => void;
  containerProps?: React.ComponentProps<'div'>;
  containerClassName?: string;
  newImage: NewImage | null;
  imageFile: File | null;
  image?: Image | null;
}

export interface IdleImageInput {
  mode: 'idle';
  newImage: ImageInputProps['newImage'];
  imageFile: ImageInputProps['imageFile'];
  image: ImageInputProps['image'];
  shouldUpdate: false;
  shouldUpload: false;
  shouldDelete: false;
}

export interface UploadImageInput
  extends Omit<
    IdleImageInput,
    'mode' | 'newImage' | 'imageFile' | 'shouldUpload'
  > {
  mode: 'upload';
  newImage: NewImage;
  shouldUpload: true;
  imageFile: File;
}

export interface UpdateImageInput
  extends Omit<IdleImageInput, 'mode' | 'newImage' | 'image' | 'shouldUpdate'> {
  mode: 'update';
  newImage: NewImage;
  shouldUpdate: true;
  image: Image;
}

export interface DeleteImageInput
  extends Omit<IdleImageInput, 'mode' | 'newImage' | 'image' | 'shouldDelete'> {
  mode: 'delete';
  newImage: null;
  shouldDelete: true;
  image: Image;
}

export type ImageInputState =
  | IdleImageInput
  | UploadImageInput
  | UpdateImageInput
  | DeleteImageInput;
