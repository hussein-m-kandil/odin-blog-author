import { DynamicFormAttrs } from '@/components/dynamic-form';
import { z } from 'zod';

export const postFormAttrs: DynamicFormAttrs = {
  title: {
    type: 'text',
    defaultValue: '',
    label: 'Title',
    placeholder: 'Awesome Blog Post',
    schema: z.string().trim().min(1, { message: 'Post title is required' }),
  },
  content: {
    type: 'textarea',
    defaultValue: '',
    label: 'Body',
    placeholder: 'This blog post is about...',
    schema: z.string().trim().min(1, { message: 'Post body is required' }),
  },
  published: {
    type: 'checkbox',
    defaultValue: true,
    label: 'Public Post',
    placeholder: '',
    schema: z.boolean(),
  },
};

export const postFormSchema = z.object(
  Object.fromEntries(
    Object.entries(postFormAttrs).map(([name, attrs]) => [name, attrs.schema])
  )
);
