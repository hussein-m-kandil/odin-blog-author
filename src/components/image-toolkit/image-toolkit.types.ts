import { Image } from '@/types';

export interface ImageToolkitProps {
  imgRef: React.RefObject<HTMLImageElement | null>;
  onUpdate?: (updatedImage: Image) => void;
  onDelete?: (image: Image) => void;
  onEnterUpdate?: () => void;
  onEnterDelete?: () => void;
  image: Image;
}
