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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, EllipsisVertical, Trash2 } from 'lucide-react';
import { Muted } from '@/components/typography/muted';
import { Lead } from '@/components/typography/lead';
import { Button } from '@/components/ui/button';
import { Post } from '@/types';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface PostCardProps {
  isMutable: boolean;
  post: Post;
}

export function PostCard({ post, isMutable = false }: PostCardProps) {
  const updateDate = new Date(post.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const postUrl = `/posts/${post.id}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='hover:underline truncate' title={post.title}>
          <Link href={`/posts/${post.id}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription className='italic'>
          By {post.author.username}
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label='Open action menu'
              className='focus-visible:outline-0 stroke-foreground/50 hover:stroke-foreground focus-visible:stroke-foreground'>
              <EllipsisVertical className='stroke-inherit' />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Post Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={postUrl} aria-description={`Read ${post.title}`}>
                  <BookOpen /> Read
                </Link>
              </DropdownMenuItem>
              {isMutable && (
                <DropdownMenuItem asChild>
                  <form
                    method='delete'
                    action={`${apiBaseUrl}/posts/${post.id}`}>
                    <Button
                      type='submit'
                      variant='link'
                      aria-description={`Delete ${post.title}`}
                      className='text-destructive has-[>svg]:px-0 hover:no-underline'>
                      <Trash2 />
                      Delete
                    </Button>
                  </form>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Lead className='line-clamp-3'>{post.content}</Lead>
      </CardContent>
      <CardFooter className='flex items-center justify-between'>
        <Muted>
          Last updated at <span className='italic'>{updateDate}</span>
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
