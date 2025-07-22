'use client';

import React from 'react';
import {
  isObject,
  getUnknownErrorMessage,
  getResErrorMessageOrThrow,
} from '@/lib/utils';
import {
  DynamicForm,
  DynamicFormSubmitHandler,
} from '@/components/dynamic-form';
import { createPostFormAttrs, createPostFormSchema } from './post-form.data';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostFormProps, NewPostInput } from './post-form.types';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { Categories } from '@/components/categories';
import { ImageForm } from '@/components/image-form';
import { Combobox } from '@/components/combobox';
import { P } from '@/components/typography/p';
import { useRouter } from 'next/navigation';
import { Image, Post } from '@/types';
import { Plus } from 'lucide-react';

const CATEGORIES_MAX_NUM = 7;

export function PostForm({ post, onSuccess, ...formProps }: PostFormProps) {
  const isUpdate = !!post;

  const [image, setImage] = React.useState<Image | null>(
    isUpdate ? post.image : null
  );
  const [allCategories, setAllCategories] = React.useState<string[]>([]);
  const [categories, setCategories] = React.useState<string[]>(
    isUpdate ? post.categories.map((c) => c.categoryName) : []
  );
  const [categoriesError, setCategoriesError] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  const {
    authData: { backendUrl, authFetch },
  } = useAuthData();

  React.useEffect(() => {
    authFetch(`${backendUrl}/posts/categories`)
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
  }, [backendUrl, authFetch]);

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
      const reqInit: RequestInit = {
        body: JSON.stringify({ ...formValues, categories, image: image?.id }),
        headers: { 'Content-Type': 'application/json' },
      };
      let res: Response;
      if (isUpdate) {
        reqInit.method = 'PUT';
        res = await authFetch(`${backendUrl}/posts/${post.id}`, reqInit);
      } else {
        reqInit.method = 'POST';
        res = await authFetch(`${backendUrl}/posts`, reqInit);
      }
      if (!res.ok) throw res;
      return res.json();
    },
    onSuccess: (resPost, [hookForm]) => {
      hookForm.reset();
      setErrorMessage('');
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          return (
            queryKey[0] === 'posts' ||
            (isUpdate && queryKey[0] === 'post' && queryKey[1] === post.id)
          );
        },
      });
      onSuccess?.();
      router.push(`/${resPost && resPost.id ? resPost.id : ''}`);
    },
    onError: async (resError, [hookForm]) => {
      try {
        if (resError instanceof Response) {
          setErrorMessage(await getResErrorMessageOrThrow(resError, hookForm));
        } else {
          throw resError;
        }
      } catch (error) {
        setErrorMessage(getUnknownErrorMessage(error));
      }
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
                  ? allCategories.filter((c) =>
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
              onRemove={(name) => {
                setCategories((cats) => cats.filter((c) => c !== name));
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
