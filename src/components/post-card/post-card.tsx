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
import { FormattedDate } from '@/components/formatted-date';
import { UsernameLink } from '@/components/username-link';
import { MutableImage } from '@/components/mutable-image';
import { PrivacyIcon } from '@/components/privacy-icon';
import { Muted, Lead } from '@/components/typography/';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const postUrl = `/${post.id}`;

  return (
    <Card
      {...props}
      className={cn('w-full flex-col justify-between gap-4', className)}>
      <CardHeader>
        <CardTitle
          title={post.title}
          className='hover:underline truncate outline-ring-50 dark:outline-foreground outline-offset-3 has-focus-visible:outline-2'>
          <Link href={postUrl}>
            <PrivacyIcon isPublic={post.published} /> <span>{post.title}</span>
          </Link>
        </CardTitle>
        <CardDescription className='italic truncate'>
          <UsernameLink user={post.author} />
        </CardDescription>
        {isMutable && (
          <CardAction>
            <PostOptionsMenu post={post} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className='mb-auto p-0'>
        {post.image && <MutableImage image={post.image} />}
        <Lead className='line-clamp-3 font-light text-lg px-6'>
          {post.content}
        </Lead>
      </CardContent>
      <CardFooter className='flex items-center justify-between'>
        <Muted>
          <FormattedDate
            createdAt={post.createdAt}
            updatedAt={post.updatedAt}
            className='max-[480px]:text-xs'
          />
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
