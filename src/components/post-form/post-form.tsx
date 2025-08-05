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
import { ImageForm } from '@/components/image-form';
import { Querybox } from '@/components/querybox';
import { useRouter } from 'next/navigation';
import { Tag, Image, Post } from '@/types';
import { Tags } from '@/components/tags';
import { Plus } from 'lucide-react';

const MAX_TAGS_NUM = 7;

export function PostForm({ post, onSuccess, ...formProps }: PostFormProps) {
  const [image, setImage] = React.useState<Image | null>(post?.image || null);
  const [tags, setTags] = React.useState<string[]>(
    post?.tags.map((t) => t.name) || []
  );
  const [errorMessage, setErrorMessage] = React.useState('');
  const [tagsError, setTagsError] = React.useState('');
  const router = useRouter();
  const {
    authData: { authAxios },
  } = useAuthData();

  const isUpdate = !!post;
  const postFormAttrs = createPostFormAttrs(post);
  const postFormSchema = createPostFormSchema(postFormAttrs);

  const isPostSavedRef = React.useRef(isUpdate);

  React.useEffect(() => {
    return () => {
      const isImageForNotSavedPost = !isPostSavedRef.current && image;
      if (isImageForNotSavedPost) {
        authAxios.delete(`/images/${image.id}`).catch();
      }
    };
  }, [authAxios, image]);

  const queryClient = useQueryClient();

  const { mutate } = useMutation<
    Post,
    Error | Response,
    Parameters<DynamicFormSubmitHandler<NewPostInput>>
  >({
    mutationFn: async (submitArgs) => {
      const formValues = submitArgs[1];
      const body = { ...formValues, tags, image: image?.id };
      const { data } = await (isUpdate
        ? authAxios.put<Post>(`/posts/${post.id}`, body)
        : authAxios.post<Post>('/posts', body));
      return data;
    },
    onSuccess: async (resPost, [hookForm]) => {
      hookForm.reset();
      setErrorMessage('');
      isPostSavedRef.current = true;
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

  const validateTag = (value: string) => /^\w*$/.test(value);
  const searchTags = async (searchValue: string) => {
    if (!searchValue) return [];
    const url = `/posts/tags?tags=${searchValue}`;
    const { data } = await authAxios.get<Tag[]>(url);
    const fetchedTags = data.map((tag) => tag.name);
    return fetchedTags.filter((t) => !tags.includes(t));
  };
  const selectTag = (selectedTag: string) => {
    if (tags.length < MAX_TAGS_NUM) {
      setTags((tags) => {
        return tags.find((t) => t.toUpperCase() === selectedTag.toUpperCase())
          ? tags
          : [...tags, selectedTag];
      });
    } else {
      setTagsError('You have reached the maximum number of tags');
    }
  };

  return (
    <div>
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
            mutate(args, { onSettled: resolve });
          })
        }>
        <div>
          <div className='flex justify-between items-baseline space-x-2'>
            <Querybox
              triggerContent={
                <>
                  Add Tag
                  <Plus className='opacity-50' />
                </>
              }
              onValidate={validateTag}
              onSearch={searchTags}
              onSelect={selectTag}
              blacklist={tags}
            />
            <Tags
              tags={tags}
              className='justify-end'
              onRemove={(tagToDel) => {
                setTags((tags) => tags.filter((t) => t !== tagToDel));
                setTagsError('');
              }}
            />
          </div>
          <ErrorMessage className='[&:not(:first-child)]:mt-2 mt-2'>
            {tagsError}
          </ErrorMessage>
        </div>
      </DynamicForm>
    </div>
  );
}

export default PostForm;
