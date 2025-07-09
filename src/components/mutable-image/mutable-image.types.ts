import { Image } from '@/types';

export interface ImageMutation {
  update: (updatedImage: Image) => void;
  delete: (image: Image) => void;
}

export interface MutableImageProps extends React.ComponentProps<'div'> {
  mutation?: ImageMutation;
  image?: Image | null;
}
