'use client';

import React from 'react';
import {
  DynamicForm,
  DynamicFormSubmitHandler,
} from '@/components/dynamic-form';
import {
  getResErrorMessageOrThrow,
  getUnknownErrorMessage,
  isObject,
} from '@/lib/utils';
import { createPostFormAttrs, createPostFormSchema } from './post-form.data';
import { PostFormProps } from './post-form.types';
import { Combobox } from '@/components/combobox';
import { Category } from '@/components/category';
import { P } from '@/components/typography/p';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Post } from '@/types';
import { z } from 'zod';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function PostForm({ post, onSuccess, ...formProps }: PostFormProps) {
  const [allCategories, setAllCategories] = React.useState<string[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    fetch(`${apiBaseUrl}/posts/categories`)
      .then((apiRes) => {
        if (apiRes.ok) return apiRes.json();
        throw apiRes;
      })
      .then((cats: { name: string }[]) => {
        if (
          Array.isArray(cats) &&
          cats.length > 0 &&
          isObject(cats[0]) &&
          typeof cats[0].name === 'string'
        ) {
          setAllCategories(cats.map((c) => c.name));
        }
      })
      .catch((error) => {
        getUnknownErrorMessage(error);
        setErrorMessage('Could not fetch any categories');
      });
  }, []);

  const postFormAttrs = createPostFormAttrs(post);
  const postFormSchema = createPostFormSchema(postFormAttrs);

  const handleCreatePost: DynamicFormSubmitHandler<
    z.infer<typeof postFormSchema>
  > = async (hookForm, values) => {
    try {
      const apiRes = await fetch(
        `${apiBaseUrl}/posts${post ? '/' + post.id : ''}`,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
          method: post ? 'PUT' : 'POST',
        }
      );
      if (apiRes.ok) {
        hookForm.reset();
        setErrorMessage('');
        onSuccess?.();
        const postData = post || ((await apiRes.json()) as Post);
        router.push(`/blog${postData && postData.id ? '/' + postData.id : ''}`);
      } else {
        setErrorMessage(await getResErrorMessageOrThrow(apiRes, hookForm));
      }
    } catch (error) {
      setErrorMessage(getUnknownErrorMessage(error));
    }
  };

  return (
    <>
      {errorMessage && (
        <P className='text-destructive text-sm text-center'>{errorMessage}</P>
      )}
      <DynamicForm
        {...formProps}
        formAttrs={postFormAttrs}
        formSchema={postFormSchema}
        onSubmit={handleCreatePost}
        submitterClassName='w-full'
        submitterLabel={
          post
            ? { idle: 'Update Post', submitting: 'Updating...' }
            : { idle: 'Create Post', submitting: 'Creating...' }
        }>
        <div className='flex justify-between items-center space-x-2'>
          <Combobox
            triggerContent={
              <>
                Add Category
                <Plus className='opacity-50' />
              </>
            }
            onSearch={(value) => {
              const sanitizedValue = value.replace(/[^\w-\s]/, '');
              return allCategories.filter((c) =>
                new RegExp(`^${sanitizedValue}`, 'i').test(c)
              );
            }}
            onSelect={(category) => {
              setCategories((cats) => {
                const uppercaseCategory = category.toUpperCase();
                return cats.includes(uppercaseCategory)
                  ? cats
                  : [...cats, uppercaseCategory];
              });
            }}
          />
          {categories.length > 0 && (
            <ul className='flex flex-wrap justify-end space-x-2 space-y-2'>
              {categories.map((c) => (
                <li key={c}>
                  <Category
                    name={c}
                    onRemove={(name) =>
                      setCategories((cats) => cats.filter((c) => c !== name))
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </DynamicForm>
    </>
  );
}

export default PostForm;
