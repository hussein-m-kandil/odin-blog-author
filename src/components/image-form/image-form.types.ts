import { Image } from '@/types';

export interface ImageFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  uploadingRef?: React.Ref<boolean>;
  onSuccess?: (image: Image | null) => void;
  onFailed?: (error: unknown) => void;
  image?: Image | null;
  label?: string;
}
