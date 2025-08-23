import { createPostFormSchema } from './post-form.data';
import { Post } from '@/types';
import { z } from 'zod';

export interface PostFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  shouldUnmountRef: React.Ref<() => Promise<boolean>>;
  post?: Post;
  onSuccess?: () => void;
}

export type NewPostInput = z.infer<ReturnType<typeof createPostFormSchema>>;
