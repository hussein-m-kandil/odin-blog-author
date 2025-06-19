'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardTitle,
  CardHeader,
  CardAction,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { OptionsMenu } from '@/components/options-menu';
import { useDialog } from '@/contexts/dialog-context';
import { Muted } from '@/components/typography/muted';
import { DeleteForm } from '@/components/delete-form';
import { BookOpen, Lock, Globe, Edit, Trash2 } from 'lucide-react';
import { Lead } from '@/components/typography/lead';
import { PostForm } from '@/components/post-form';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface PostCardProps extends React.ComponentProps<'div'> {
  isMutable: boolean;
  post: Post;
}

export function PostCard({
  isMutable = false,
  className,
  post,
  ...props
}: PostCardProps) {
  const postUrl = `/blog/${post.id}`;

  const { showDialog, hideDialog } = useDialog();
  const router = useRouter();
  const id = React.useId();

  const showUpdateForm = () => {
    const formProps = {
      'aria-labelledby': `update-post-form-${id}`,
      onSuccess: hideDialog,
      post,
    };
    showDialog({
      body: <PostForm {...formProps} />,
      title: <span id={formProps['aria-labelledby']}>Update Post</span>,
      description: 'Do whatever updates on the post, then click "update".',
    });
  };

  const showDeleteForm = () => {
    const reqInit = { method: 'DELETE' };
    const formProps = {
      method: 'dialog',
      subject: post.title,
      onCancel: hideDialog,
      'aria-labelledby': `delete-post-form-${id}`,
      onSuccess: () => (hideDialog(), router.replace('/blog')),
      delReqFn: () => fetch(`${apiBaseUrl}/posts/${post.id}`, reqInit),
    };
    showDialog({
      body: <DeleteForm {...formProps} />,
      title: <span id={formProps['aria-labelledby']}>Delete Post</span>,
      description: 'You are deleting a post now! This action cannot be undone.',
    });
  };

  const srOnlyPostTitle = <span className='sr-only'>{post.title}</span>;

  return (
    <Card
      {...props}
      className={cn('aspect-square flex-col justify-between', className)}>
      <CardHeader>
        <CardTitle
          title={post.title}
          className='hover:underline truncate outline-ring-50 dark:outline-foreground outline-offset-3 has-focus-visible:outline-2'>
          <Link href={postUrl}>
            <span>
              {post.published ? (
                <span title='Public' aria-label='Public'>
                  <Globe className='inline' size={14} />
                </span>
              ) : (
                <span title='Private' aria-label='Private'>
                  <Lock className='inline' size={14} />
                </span>
              )}
            </span>
            {` ${post.title}`}
          </Link>
        </CardTitle>
        <CardDescription>
          <Link href={`/profile/${post.authorId}`} className='italic'>
            @{post.author.username}
          </Link>
        </CardDescription>
        <CardAction>
          <OptionsMenu
            triggerLabel='Open post options menu'
            menuLabel='Post options menu'
            menuItems={[
              <Link
                href={postUrl}
                key={`read-${post.id}`}
                className='cursor-default flex w-full items-center gap-2'>
                <BookOpen /> Read {srOnlyPostTitle}
              </Link>,
              isMutable && [
                <button
                  type='button'
                  onClick={showUpdateForm}
                  key={`update-${post.id}`}>
                  <Edit /> Update {srOnlyPostTitle}
                </button>,
                <button
                  type='button'
                  onClick={showDeleteForm}
                  key={`delete-${post.id}`}
                  className='text-destructive!'>
                  <Trash2 /> Delete {srOnlyPostTitle}
                </button>,
              ],
            ].flat()}
          />
        </CardAction>
      </CardHeader>
      <CardContent className='mt-auto'>
        <Lead className='line-clamp-3 font-light'>{post.content}</Lead>
      </CardContent>
      <CardFooter className='flex items-center justify-between'>
        <Muted className='italic'>
          Last updated at {formatDate(post.updatedAt)}
        </Muted>
        <Button type='button' variant={'outline'} asChild>
          <Link
            href={postUrl}
            title='Read more'
            aria-label={`Read more about ${post.title}`}>
            <BookOpen />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PostCard;
