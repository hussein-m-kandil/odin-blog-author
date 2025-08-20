import { NewImage } from '@/types';

export interface ImageToolkitProps {
  image?: NewImage | null;
  onEnterReset?: () => void;
  onEnterDelete?: () => void;
  onEnterUpdate?: () => void;
  imgRef: React.RefObject<HTMLImageElement | null>;
  onUpdate: (data: Partial<NewImage>) => void;
  onDelete: () => void;
  onReset: () => void;
}
