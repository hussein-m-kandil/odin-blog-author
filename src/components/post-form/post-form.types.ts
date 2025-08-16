import { createPostFormSchema } from './post-form.data';
import { Post } from '@/types';
import { z } from 'zod';

export interface PostFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  post?: Post;
  onSuccess?: () => void;
  shouldUnmountRef: React.Ref<() => Promise<boolean>>;
}

export type NewPostInput = z.infer<ReturnType<typeof createPostFormSchema>>;
