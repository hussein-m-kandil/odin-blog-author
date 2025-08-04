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
import { P } from '@/components/typography/p';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

const CATEGORIES_MAX_NUM = 7;

export function PostForm({ post, onSuccess, ...formProps }: PostFormProps) {
  const isUpdate = !!post;

  const [image, setImage] = React.useState<Image | null>(
    isUpdate ? post.image : null
  );
  const [allCategories, setAllCategories] = React.useState<string[]>([]);
  const [categories, setCategories] = React.useState<string[]>(
    isUpdate ? post.categories.map((c) => c.name) : []
  );
  const [categoriesError, setCategoriesError] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const {
    authData: { authAxios },
  } = useAuthData();

  React.useEffect(() => {
    authAxios
      .get<Category[]>('/posts/categories')
      .then(({ data: cats }) => {
        setAllCategories(cats.map((c) => c.name));
      })
      .catch((error) => {
        getUnknownErrorMessage(error);
        setErrorMessage('Could not load the categories');
      });
  }, [authAxios]);

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

  return (
    <>
      {errorMessage && (
        <P className='text-destructive text-sm text-center'>{errorMessage}</P>
      )}
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
              searchValidator={(value: string) => /^\w*$/.test(value)}
              onSearch={(value) => {
                return value
                  ? allCategories.filter(
                      (c) =>
                        !categories.includes(c) &&
                        new RegExp(`^${value}`, 'i').test(c)
                    )
                  : [];
              }}
              onSelect={(category) => {
                if (categories.length < CATEGORIES_MAX_NUM) {
                  setCategories((cats) => {
                    return cats.find(
                      (c) => c.toUpperCase() === category.toUpperCase()
                    )
                      ? cats
                      : [...cats, category];
                  });
                } else {
                  setCategoriesError(
                    'You have reached the maximum number of categories'
                  );
                }
              }}
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
