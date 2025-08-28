import React from 'react';
import { useDialog } from '@/contexts/dialog-context';
import { PostForm } from '@/components/post-form';
import { Post } from '@/types';

export function usePostFormDialog({ post }: { post?: Post } = {}) {
  const shouldUnmountPostFormRef = React.useRef<() => Promise<boolean>>(null);
  const { showDialog, hideDialog } = useDialog();

  let title: string, description: string;
  if (post) {
    description = 'Do whatever updates on the post, then click "update".';
    title = 'Update Post';
  } else {
    description = 'Use the following form to create a new post.';
    title = 'Create Post';
  }

  return {
    showPostForm: () => {
      showDialog(
        {
          title,
          description,
          body: (
            <PostForm
              post={post}
              onClose={hideDialog}
              onSuccess={hideDialog}
              shouldUnmountRef={shouldUnmountPostFormRef}
            />
          ),
        },
        () => {
          const shouldUnmount = shouldUnmountPostFormRef.current;
          if (shouldUnmount) return shouldUnmount();
          return true;
        }
      );
    },
  };
}
