import { NewImage } from '@/types';

export interface ImageToolkitProps {
  imgRef: React.RefObject<HTMLImageElement | null>;
  onUpdate: (updatedImage: NewImage) => void;
  onDelete: (image: NewImage) => void;
  onEnterUpdate?: () => void;
  onEnterDelete?: () => void;
  image: NewImage;
}
