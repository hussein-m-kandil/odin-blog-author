'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { P } from '@/components/typography/p';
import { Plus, Trash2, PanelLeftClose } from 'lucide-react';
import { PostForm } from '../post-form';
import { Post } from '@/types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function PostFormDialog({
  post,
  toDelete = false,
}: {
  post?: Post;
  toDelete?: boolean;
}) {
  const isDeleteForm = toDelete && post;

  if (!isDeleteForm && toDelete) throw new Error('Missing a post to delete!');

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const title = post
    ? toDelete
      ? 'Delete Post'
      : 'Update Post'
    : 'Create a New Post';

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {isDeleteForm ? (
          <Button
            type='submit'
            variant='link'
            aria-description={`Delete ${post.title}`}
            className='text-destructive has-[>svg]:px-0 hover:no-underline'>
            <Trash2 />
            Delete
          </Button>
        ) : (
          <Button
            type='button'
            title={title}
            variant='outline'
            aria-label={title}>
            <Plus className='size-5 stroke-3' />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>{title}</DialogTitle>
          <DialogDescription>
            {isDeleteForm
              ? 'Your deleting a post now, and this action cannot be undone.'
              : `${title
                  .toLowerCase()
                  .replace(/^./, (c) => c.toUpperCase())} here.
            Click "${title.split(' ')[0]}" when you're done.`}
          </DialogDescription>
        </DialogHeader>
        {isDeleteForm ? (
          <form method='delete' action={`${apiBaseUrl}/posts/${post.id}`}>
            <P>
              Do you really want to delete &quot;
              <span className='font-bold'>{`${post.title.slice(0, 21)}${
                post.title.length > 24 ? '...' : ''
              }`}</span>
              &quot;?
            </P>
            <div className='flex justify-end gap-4 mt-5'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsDialogOpen(false)}
                aria-description={`Cancel the deletion of ${post.title}`}>
                <PanelLeftClose />
                Cancel
              </Button>
              <Button
                type='submit'
                variant='destructive'
                aria-description={`Delete ${post.title}`}>
                <Trash2 />
                Delete
              </Button>
            </div>
          </form>
        ) : (
          <PostForm post={post} onSuccess={() => setIsDialogOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PostFormDialog;
