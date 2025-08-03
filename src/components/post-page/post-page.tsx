'use client';

import { PostOptionsMenu } from '@/components/post-options-menu';
import { H1, H2, Lead, Muted } from '@/components/typography';
import { FormattedDate } from '@/components/formatted-date';
import { MutableImage } from '@/components/mutable-image';
import { UsernameLink } from '@/components/username-link';
import { PostPageSkeleton } from './post-page.skeleton';
import { PrivacyIcon } from '@/components/privacy-icon';
import { useAuthData } from '@/contexts/auth-context';
import { QueryError } from '@/components/query-error';
import { Categories } from '@/components/categories';
import { useQuery } from '@tanstack/react-query';
import { Comments } from '@/components/comments';
import { cn } from '@/lib/utils';
import { Post } from '@/types';

export function PostPage({
  className,
  postUrl,
  postId,
  ...props
}: React.ComponentProps<'div'> & {
  postId: Post['id'];
  postUrl: string;
}) {
  const {
    authData: { authAxios, user },
  } = useAuthData();

  const {
    data: post,
    status,
    refetch,
  } = useQuery<Post>({
    queryKey: ['post', postId, postUrl],
    queryFn: async () => (await authAxios(postUrl)).data,
  });

  const titleId = `title-${post?.id}`;

  return (
    <div {...props} className={cn('max-w-5xl mx-auto', className)}>
      {status === 'error' ? (
        <div className={className}>
          <QueryError className='mt-6' onRefetch={refetch}>
            Sorry, we could not get the post data
          </QueryError>
        </div>
      ) : status === 'pending' ? (
        <div className={className}>
          <PostPageSkeleton />
        </div>
      ) : (
        <>
          <header className='mt-6'>
            <div className='flex justify-between items-baseline border-b pb-2'>
              <H1 id={titleId} className='text-3xl text-center'>
                {post.title}
              </H1>
              {user?.id === post.authorId && <PostOptionsMenu post={post} />}
            </div>
            <div className='flex items-baseline justify-between mt-1'>
              <Muted className='flex'>
                <PrivacyIcon isPublic={post.published} />
                &nbsp;
                <UsernameLink user={post.author} prefix='By ' />
              </Muted>
              <Muted>
                <FormattedDate
                  createdAt={post.createdAt}
                  updatedAt={post.updatedAt}
                />
              </Muted>
            </div>
          </header>
          <main>
            <article aria-labelledby={titleId}>
              {post.image && (
                <MutableImage image={post.image} className='my-6' />
              )}
              <Lead className='text-foreground font-light mb-6'>
                {post.content}
              </Lead>
              <Categories
                categories={post.categories}
                className='justify-end'
              />
              <section className='my-4'>
                <header>
                  <H2 className='text-center text-xl'>
                    {post._count.comments} Comments
                  </H2>
                </header>
                <main>
                  <Comments initialComments={post.comments} post={post} />
                </main>
              </section>
            </article>
          </main>
        </>
      )}
    </div>
  );
}

export default PostPage;
