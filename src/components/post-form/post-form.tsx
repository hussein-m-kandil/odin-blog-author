'use client';

import React from 'react';
import {
  DynamicForm,
  DynamicFormSubmitHandler,
} from '@/components/dynamic-form';
import { createPostFormAttrs, createPostFormSchema } from './post-form.data';
import { Query, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageInput, useImageInputState } from '@/components/image-input';
import { parseAxiosAPIError, getUnknownErrorMessage } from '@/lib/utils';
import { PostFormProps, NewPostInput } from './post-form.types';
import { ErrorMessage } from '@/components/error-message';
import { CloseButton } from '@/components/close-button';
import { useAuthData } from '@/contexts/auth-context';
import { Querybox } from '@/components/querybox';
import { UseFormReturn } from 'react-hook-form';
import { Plus, PencilLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AxiosRequestConfig } from 'axios';
import { Tags } from '@/components/tags';
import { Tag, Post } from '@/types';
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
  shouldUnmountRef,
  post,
  onClose,
  onSuccess,
  ...formProps
}: PostFormProps) {
  const postTags = React.useMemo(() => {
    return post?.tags.map((t) => t.name) || [];
  }, [post]);
  const [tags, setTags] = React.useState<string[]>(postTags);
  const [tagsError, setTagsError] = React.useState('');
  const router = useRouter();

  const {
    authData: { authAxios },
  } = useAuthData();

  const {
    handleUploadProgress,
    refreshNewImageUrl,
    applyNewImage,
    clearNewImage,
    setNewImage,
    mode,
    newImage,
    imageFile,
    fileInputRef,
    uploadPercent,
  } = useImageInputState(post?.image);

  const discardWarningIdRef = React.useRef<number | string>(null);
  const hookFormRef = React.useRef<UseFormReturn>(null);

  const isUpdate = !!post;
  const imageModified = mode !== 'idle';
  const postFormAttrs = createPostFormAttrs(post);
  const postFormSchema = createPostFormSchema(postFormAttrs);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    Post,
    Error | Response,
    Parameters<DynamicFormSubmitHandler<NewPostInput>>
  >({
    mutationFn: async (submitArgs) => {
      const body = new FormData();
      const formEntries = Object.entries(submitArgs[1]);
      formEntries.forEach(([k, v]) => body.set(k, v));
      tags.forEach((t, i) => body.set(`tags[${i}]`, t));
      if (imageFile) body.set('image', imageFile);
      Object.entries(newImage || {}).forEach(([k, v]) =>
        body.set(`imagedata[${k}]`, v)
      );
      const config: AxiosRequestConfig = {
        onUploadProgress: handleUploadProgress,
      };
      const { data } = await (isUpdate
        ? authAxios.put<Post>(`/posts/${post.id}`, body, config)
        : authAxios.post<Post>('/posts', body, config));
      return data;
    },
    onSuccess: async (resPost, [hookForm]) => {
      hookForm.reset();
      await queryClient.invalidateQueries({
        predicate: getInvalidateQueryPredicate(post),
      });
      if (!isUpdate) router.push(`/${resPost.id}`);
      onSuccess?.();
    },
    onError: async (error, [hookForm]) => {
      refreshNewImageUrl();
      toast.error('Post submission failed', {
        description:
          parseAxiosAPIError(error, hookForm).message ||
          getUnknownErrorMessage(error),
        duration: Infinity,
      });
    },
  });

  const shouldUnmount = React.useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        if (discardWarningIdRef.current !== null) {
          toast.dismiss(discardWarningIdRef.current);
        }
        if (isPending) {
          toast.warning('Please wait until the image finishes submitting!');
          return resolve(false);
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
        const hasNewTags =
          tags.length !== postTags.length ||
          tags.some((t) => !postTags.includes(t));
        if (!isFormDirty && !imageModified && !hasNewTags) {
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
              onClick: () => resolve(true),
            },
          }
        );
      }),
    [postFormAttrs, imageModified, postTags, isPending, tags]
  );

  React.useImperativeHandle(shouldUnmountRef, () => shouldUnmount, [
    shouldUnmount,
  ]);

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
      <DynamicForm
        {...formProps}
        className='my-4'
        hookFormRef={hookFormRef}
        formAttrs={postFormAttrs}
        formSchema={postFormSchema}
        submitterClassName='w-full'
        submitterIcon={<PencilLine />}
        aria-label={`${isUpdate ? 'Update' : 'Create'} post form`}
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
        }
        topChildren={
          <ImageInput
            ref={fileInputRef}
            newImage={newImage}
            uploadPercent={uploadPercent}
            clearNewImage={clearNewImage}
            applyNewImage={applyNewImage}
            setNewImage={setNewImage}
            submitting={isPending}
            imageFile={imageFile}
            image={post?.image}
          />
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
      {onClose && (
        <CloseButton
          onClose={async () => {
            if (await shouldUnmount()) onClose();
          }}
        />
      )}
    </div>
  );
}

export default PostForm;
