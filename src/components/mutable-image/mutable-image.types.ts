import { NewImage } from '@/types';
import { ImageToolkitProps } from '@/components/image-toolkit';

export interface ImageMutation {
  update: ImageToolkitProps['onUpdate'];
  delete: ImageToolkitProps['onDelete'];
  reset: ImageToolkitProps['onReset'];
}

export interface MutableImageProps extends React.ComponentProps<'div'> {
  mutation?: ImageMutation | null;
  image?: NewImage | null;
}
