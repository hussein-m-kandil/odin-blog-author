'use client';

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
import { Muted } from '@/components/typography/muted';
import { PostFormDialog } from '../post-form-dialog';
import { BookOpen, Lock, Globe } from 'lucide-react';
import { Lead } from '@/components/typography/lead';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { Post } from '@/types';
import Link from 'next/link';

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

  return (
    <Card
      {...props}
      className={cn('aspect-square flex-col justify-between', className)}>
      <CardHeader>
        <CardTitle
          title={post.title}
          className='hover:underline truncate outline-ring-50 dark:outline-foreground outline-offset-3 has-focus-visible:outline-2'>
          <Link href={postUrl}>{post.title}</Link>
        </CardTitle>
        <CardDescription>
          {post.published ? (
            <span className='cursor-default' title='Public' aria-label='Public'>
              <Globe className='inline' size={14} />
            </span>
          ) : (
            <span
              className='cursor-default'
              title='Private'
              aria-label='Private'>
              <Lock className='inline' size={14} />
            </span>
          )}{' '}
          <Link href={`/users/${post.authorId}`} className='italic'>
            By @{post.author.username}
          </Link>
        </CardDescription>
        <CardAction>
          <OptionsMenu
            menuLabel='Post options menu'
            triggerLabel='Open post options menu'
            menuItems={[
              <Link
                href={postUrl}
                key={`read-${post.id}`}
                className='cursor-default flex w-full items-center gap-2'>
                <BookOpen /> Read <span className='sr-only'>{post.title}</span>
              </Link>,
              isMutable && [
                <PostFormDialog post={post} key={`update-${post.id}`} />,
                <PostFormDialog
                  post={post}
                  showDeleteForm={true}
                  key={`delete-${post.id}`}
                />,
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
