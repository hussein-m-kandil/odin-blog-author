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
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { BookOpen, EllipsisVertical, Lock, Globe } from 'lucide-react';
import { Muted } from '@/components/typography/muted';
import { PostFormDialog } from '../post-form-dialog';
import { Lead } from '@/components/typography/lead';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Post } from '@/types';
import Link from 'next/link';

interface PostCardProps {
  isMutable: boolean;
  post: Post;
}

export function PostCard({ post, isMutable = false }: PostCardProps) {
  const postUrl = `/blog/${post.id}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='hover:underline truncate' title={post.title}>
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
            By {post.author.username}
          </Link>
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label='Open action menu'
              className='focus-visible:outline-0 text-muted-foreground hover:text-foreground focus-visible:text-foreground'>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Post Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href={postUrl}
                  className='cursor-default flex w-full items-center gap-2'>
                  <BookOpen /> Read{' '}
                  <span className='sr-only'>{post.title}</span>
                </Link>
              </DropdownMenuItem>
              {isMutable && (
                <>
                  <DropdownMenuItem>
                    <PostFormDialog post={post} />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <PostFormDialog post={post} showDeleteForm={true} />
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Lead className='line-clamp-3'>{post.content}</Lead>
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
