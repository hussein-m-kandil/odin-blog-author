import { DynamicFormAttrs } from '@/components/dynamic-form';
import { Post } from '@/types';
import { z } from 'zod';

export const createPostFormAttrs = (post?: Post): DynamicFormAttrs => {
  return {
    title: {
      type: 'text',
      defaultValue: post ? post.title : '',
      label: 'Title',
      placeholder: 'Awesome Blog Post',
      schema: z.string().trim().min(1, { message: 'Post title is required' }),
    },
    content: {
      type: 'textarea',
      defaultValue: post ? post.content : '',
      label: 'Body',
      placeholder: 'This blog post is about...',
      schema: z.string().trim().min(1, { message: 'Post body is required' }),
    },
    published: {
      type: 'checkbox',
      defaultValue: post ? post.published : true,
      label: 'Public Post',
      placeholder: '',
      schema: z.boolean(),
    },
  };
};

export const createPostFormSchema = (
  postFormAttrs: ReturnType<typeof createPostFormAttrs>
) => {
  return z.object(
    Object.fromEntries(
      Object.entries(postFormAttrs).map(([name, attrs]) => [name, attrs.schema])
    )
  );
};
