import { Post } from '@/types';

export interface PostFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  post?: Post;
  onSuccess?: () => void;
}
