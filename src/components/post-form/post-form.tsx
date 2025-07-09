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
import { PostFormProps, NewPostInput } from './post-form.types';
import { ErrorMessage } from '@/components/error-message';
import { Categories } from '@/components/categories';
import { ImageForm } from '@/components/image-form';
import { Combobox } from '@/components/combobox';
import { P } from '@/components/typography/p';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Image, Post } from '@/types';

const CATEGORIES_MAX_NUM = 7;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function PostForm({ post, onSuccess, ...formProps }: PostFormProps) {
  const [image, setImage] = React.useState<Image | null>(post?.image || null);
  const [allCategories, setAllCategories] = React.useState<string[]>([]);
  const [categories, setCategories] = React.useState<string[]>(
    post ? post.categories.map((c) => c.categoryName) : []
  );
  const [categoriesError, setCategoriesError] = React.useState('');
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

  const handleCreatePost: DynamicFormSubmitHandler<NewPostInput> = async (
    hookForm,
    values
  ) => {
    try {
      const postValues: NewPostInput & {
        categories: string[];
        image?: string;
      } = { ...values, categories };
      if (image) postValues.image = image.id;
      const apiRes = await fetch(
        `${apiBaseUrl}/posts${post ? '/' + post.id : ''}`,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postValues),
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
      <ImageForm image={image} onSuccess={(img) => setImage(img)} />
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
