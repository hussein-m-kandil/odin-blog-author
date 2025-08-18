import { Image } from '@/types';
import { ImageToolkitProps } from '@/components/image-toolkit';

export interface ImageMutation {
  update: ImageToolkitProps['onUpdate'];
  delete: ImageToolkitProps['onDelete'];
}

export interface MutableImageProps extends React.ComponentProps<'div'> {
  image?: Image | null;
  mutation?: ImageMutation;
}
