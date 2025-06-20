'use client';

import Link from 'next/link';
import {
  Card,
  CardTitle,
  CardAction,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { PostOptionsMenu } from '@/components/post-options-menu';
import { PrivacyIcon } from '@/components/privacy-icon';
import { Muted } from '@/components/typography/muted';
import { Lead } from '@/components/typography/lead';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { BookOpen } from 'lucide-react';
import { Post } from '@/types';

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
          <Link href={postUrl}>
            <PrivacyIcon isPublic={post.published} /> <span>{post.title}</span>
          </Link>
        </CardTitle>
        <CardDescription>
          <Link href={`/profile/${post.authorId}`} className='italic'>
            @{post.author.username}
          </Link>
        </CardDescription>
        {isMutable && (
          <CardAction>
            <PostOptionsMenu post={post} />
          </CardAction>
        )}
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
