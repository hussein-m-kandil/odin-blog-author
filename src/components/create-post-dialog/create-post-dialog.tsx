'use client';

import React from 'react';
import { PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostForm } from '@/components/post-form';
import { useDialog } from '@/contexts/dialog-context/';

export function CreatePostDialog({
  className,
  ...triggerProps
}: React.ComponentProps<'button'>) {
  const { showDialog, hideDialog } = useDialog();
  const id = React.useId();

  const title = 'Create a New Post';

  const showPostFormDialog = () => {
    const formProps = {
      'aria-labelledby': `create-post-form-${id}`,
      onSuccess: hideDialog,
    };
    showDialog({
      title: <span id={formProps['aria-labelledby']}>{title}</span>,
      description: 'Use the following form to create a new post.',
      body: <PostForm {...formProps} />,
    });
  };

  return (
    <Button
      onClick={showPostFormDialog}
      className={className}
      aria-label={title}
      title={title}
      size='icon'
      type='button'
      variant='outline'
      {...triggerProps}>
      <PenSquare />
    </Button>
  );
}

export default CreatePostDialog;
