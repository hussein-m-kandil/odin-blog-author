'use client';

import { PostOptionsMenu } from '@/components/post-options-menu';
import { H1, H2, Lead, Muted } from '@/components/typography';
import { FormattedDate } from '@/components/formatted-date';
import { BlogComments } from '@/components/blog-comments';
import { MutableImage } from '@/components/mutable-image';
import { ErrorMessage } from '@/components/error-message';
import { PrivacyIcon } from '@/components/privacy-icon';
import { useAuthData } from '@/contexts/auth-context';
import { Categories } from '@/components/categories';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Post } from '@/types';

export function PostPage({
  className,
  postUrl,
  ...props
}: React.ComponentProps<'div'> & {
  postUrl: string | URL;
}) {
  const {
    authData: { authFetch, user },
  } = useAuthData();

  const { data: post, status } = useQuery<Post>({
    queryKey: ['post', postUrl],
    queryFn: async () => (await authFetch(postUrl)).json(),
  });

  const titleId = `title-${post?.id}`;
  const userId = user?.id;

  return (
    <div {...props} className={cn('max-w-5xl mx-auto', className)}>
      {status === 'error' ? (
        <div className={className}>
          <ErrorMessage className='mt-6'>
            Sorry, we could not get the post data
          </ErrorMessage>
        </div>
      ) : status === 'pending' ? ( // TODO: Replace this with a skeleton
        <div className={className}>
          <Loader
            aria-label='Loading'
            className='absolute top-1/2 left-1/2 -translate-1/2 animate-spin'
          />
        </div>
      ) : (
        <>
          <header className='mt-6'>
            <div className='flex justify-between items-baseline border-b pb-2'>
              <H1 id={titleId} className='text-3xl'>
                {post.title}
              </H1>
              {user?.id === post.authorId && <PostOptionsMenu post={post} />}
            </div>
            <div className='flex items-baseline justify-between mt-1'>
              <div className='flex'>
                <Muted>
                  <PrivacyIcon isPublic={post.published} />
                  <span>@{post.author.username}</span>
                </Muted>
              </div>
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
              <MutableImage image={post.image} className='my-6' />
              <Lead className='text-foreground font-light mb-6'>
                {post.content}
              </Lead>
              <Categories
                categories={post.categories}
                className='justify-end'
              />
              <section className='my-4'>
                <header>
                  <H2 className='text-center text-xl'>Comments</H2>
                </header>
                <main>
                  <BlogComments
                    currentUserId={userId}
                    comments={post.comments}
                    post={post}
                  />
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
