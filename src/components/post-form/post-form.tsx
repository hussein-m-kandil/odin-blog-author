'use client';

import React from 'react';
import {
  DynamicForm,
  DynamicFormSubmitHandler,
} from '@/components/dynamic-form';
import { createPostFormAttrs, createPostFormSchema } from './post-form.data';
import { parseAxiosAPIError, getUnknownErrorMessage } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostFormProps, NewPostInput } from './post-form.types';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { Categories } from '@/components/categories';
import { ImageForm } from '@/components/image-form';
import { Combobox } from '@/components/combobox';
import { Category, Image, Post } from '@/types';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

const CATEGORIES_MAX_NUM = 7;

export function PostForm({ post, onSuccess, ...formProps }: PostFormProps) {
  const [image, setImage] = React.useState<Image | null>(post?.image || null);
  const [categories, setCategories] = React.useState<string[]>(
    post?.categories.map((c) => c.name) || []
  );
  const [categoriesError, setCategoriesError] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();
  const {
    authData: { authAxios },
  } = useAuthData();

  const isUpdate = !!post;
  const postFormAttrs = createPostFormAttrs(post);
  const postFormSchema = createPostFormSchema(postFormAttrs);

  const queryClient = useQueryClient();

  const upsertPostMutation = useMutation<
    Post,
    Error | Response,
    Parameters<DynamicFormSubmitHandler<NewPostInput>>
  >({
    mutationFn: async (submitArgs) => {
      const formValues = submitArgs[1];
      const body = { ...formValues, categories, image: image?.id };
      const { data } = await (isUpdate
        ? authAxios.put<Post>(`/posts/${post.id}`, body)
        : authAxios.post<Post>('/posts', body));
      return data;
    },
    onSuccess: async (resPost, [hookForm]) => {
      hookForm.reset();
      setErrorMessage('');
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          return (
            queryKey[0] === 'posts' ||
            (isUpdate && queryKey[0] === 'post' && queryKey[1] === post.id)
          );
        },
      });
      onSuccess?.();
      if (!isUpdate) router.push(`/${resPost.id}`);
    },
    onError: async (error, [hookForm]) => {
      setErrorMessage(
        parseAxiosAPIError(error, hookForm).message ||
          getUnknownErrorMessage(error)
      );
    },
  });

  const validateCategory = (value: string) => /^\w*$/.test(value);
  const searchCategories = async (searchValue: string) => {
    if (!searchValue) return [];
    const url = `/posts/categories?categories=${searchValue}`;
    const { data } = await authAxios.get<Category[]>(url);
    const fetchedCategories = data.map((category) => category.name);
    return fetchedCategories.filter(
      (category) =>
        !categories.includes(category) &&
        new RegExp(`^${searchValue}`, 'i').test(category)
    );
  };
  const selectCategory = (selectedCategory: string) => {
    if (categories.length < CATEGORIES_MAX_NUM) {
      setCategories((cats) => {
        return cats.find(
          (c) => c.toUpperCase() === selectedCategory.toUpperCase()
        )
          ? cats
          : [...cats, selectedCategory];
      });
    } else {
      setCategoriesError('You have reached the maximum number of categories');
    }
  };

  return (
    <>
      <ErrorMessage>{errorMessage}</ErrorMessage>
      <ImageForm image={image} onSuccess={(img) => setImage(img)} />
      <DynamicForm
        {...formProps}
        formAttrs={postFormAttrs}
        formSchema={postFormSchema}
        submitterClassName='w-full'
        submitterLabel={
          isUpdate
            ? { idle: 'Update Post', submitting: 'Updating...' }
            : { idle: 'Create Post', submitting: 'Creating...' }
        }
        onSubmit={(...args) =>
          new Promise((resolve) => {
            // This way the `DynamicForm` can monitor the submitting period
            upsertPostMutation.mutate(args, { onSettled: resolve });
          })
        }>
        <div>
          <div className='flex justify-between items-baseline space-x-2'>
            <Combobox
              triggerContent={
                <>
                  Add Category
                  <Plus className='opacity-50' />
                </>
              }
              onValidate={validateCategory}
              onSearch={searchCategories}
              onSelect={selectCategory}
              blacklist={categories}
            />
            <Categories
              categories={categories}
              className='justify-end'
              onRemove={(catToDel) => {
                setCategories((cats) => cats.filter((c) => c !== catToDel));
                setCategoriesError('');
              }}
            />
          </div>
          <ErrorMessage className='[&:not(:first-child)]:mt-2 mt-2'>
            {categoriesError}
          </ErrorMessage>
        </div>
      </DynamicForm>
    </>
  );
}

export default PostForm;
