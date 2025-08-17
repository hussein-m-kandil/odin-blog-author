'use client';

import React from 'react';
import {
  DynamicForm,
  DynamicFormSubmitHandler,
} from '@/components/dynamic-form';
import { createPostFormAttrs, createPostFormSchema } from './post-form.data';
import { Query, useMutation, useQueryClient } from '@tanstack/react-query';
import { parseAxiosAPIError, getUnknownErrorMessage } from '@/lib/utils';
import { PostFormProps, NewPostInput } from './post-form.types';
import { ErrorMessage } from '@/components/error-message';
import { useAuthData } from '@/contexts/auth-context';
import { ImageForm } from '@/components/image-form';
import { Querybox } from '@/components/querybox';
import { UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Tag, Image, Post } from '@/types';
import { Tags } from '@/components/tags';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const MAX_TAGS_NUM = 7;

const getInvalidateQueryPredicate = (post?: Post) => {
  return ({ queryKey }: Query) => {
    return (
      queryKey[0] === 'posts' ||
      (!!post && queryKey[0] === 'post' && queryKey[1] === post.id)
    );
  };
};

export function PostForm({
  post,
  onSuccess,
  shouldUnmountRef,
  ...formProps
}: PostFormProps) {
  const postTags = React.useMemo(() => {
    return post?.tags.map((t) => t.name) || [];
  }, [post]);

  const [image, setImage] = React.useState<Image | null>(post?.image || null);
  const [tags, setTags] = React.useState<string[]>(postTags);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [tagsError, setTagsError] = React.useState('');
  const router = useRouter();
  const {
    authData: { authAxios },
  } = useAuthData();

  const discardWarningIdRef = React.useRef<number | string>(null);
  const imageUploadingRef = React.useRef<boolean>(false);
  const hookFormRef = React.useRef<UseFormReturn>(null);

  const isUpdate = !!post;
  const postFormAttrs = createPostFormAttrs(post);
  const postFormSchema = createPostFormSchema(postFormAttrs);

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
      await queryClient.invalidateQueries({
        predicate: getInvalidateQueryPredicate(post),
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

  React.useImperativeHandle(
    shouldUnmountRef,
    () => {
      return () =>
        new Promise((resolve) => {
          if (imageUploadingRef.current) {
            toast.warning('Please wait until the image finishes uploading!');
            return resolve(false);
          }
          if (discardWarningIdRef.current !== null) {
            toast.dismiss(discardWarningIdRef.current);
          }
          if (image && isUpdate && !!post.image) {
            queryClient.invalidateQueries({
              predicate: getInvalidateQueryPredicate(post),
            });
          }
          const textFieldNames = Object.entries(postFormAttrs)
            .filter((attr) => attr[1].type === 'text')
            .map(([name]) => name);
          let isFormDirty = false;
          if (hookFormRef.current) {
            for (const name of textFieldNames) {
              isFormDirty = hookFormRef.current.getFieldState(name).isDirty;
              if (isFormDirty) break;
            }
          }
          const hasNotSavedImage = image && (!isUpdate || !post.image);
          const hasNewTags =
            tags.length && JSON.stringify(postTags) !== JSON.stringify(tags);
          if (!isFormDirty && !hasNotSavedImage && !hasNewTags) {
            return resolve(true);
          }
          discardWarningIdRef.current = toast.warning(
            'Your changes will not be saved!',
            {
              duration: Infinity,
              classNames: {
                toast: 'flex-wrap!',
                cancelButton: 'justify-center! h-auto! basis-3/7! p-1!',
                actionButton: 'justify-center! h-auto! basis-3/7! p-1!',
              },
              action: { label: 'Keep', onClick: () => resolve(false) },
              cancel: {
                label: 'Discard',
                onClick: () => {
                  if (hasNotSavedImage) {
                    authAxios.delete(`/images/${image.id}`).catch();
                  }
                  resolve(true);
                },
              },
            }
          );
        });
    },
    [
      postFormAttrs,
      queryClient,
      authAxios,
      postTags,
      isUpdate,
      image,
      post,
      tags,
    ]
  );

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
      <ImageForm
        image={image}
        uploadingRef={imageUploadingRef}
        onSuccess={(img) => setImage(img)}
      />
      <DynamicForm
        {...formProps}
        hookFormRef={hookFormRef}
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
