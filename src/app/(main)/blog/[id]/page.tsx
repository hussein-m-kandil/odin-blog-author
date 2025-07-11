import { PostOptionsMenu } from '@/components/post-options-menu';
import { H1, H2, Muted, Lead } from '@/components/typography/';
import { FormattedDate } from '@/components/formatted-date';
import { BlogComments } from '@/components/blog-comments';
import { ErrorMessage } from '@/components/error-message';
import { PrivacyIcon } from '@/components/privacy-icon';
import { Comment as CommentType, Post } from '@/types';
import { Categories } from '@/components/categories';
import { authedFetch, getUserId } from '@/lib/auth';
import { MutableImage } from '@/components/mutable-image';

export default async function BlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const userId = await getUserId();

  const [commentsRes, postRes] = await Promise.all([
    authedFetch(`/posts/${id}/comments`),
    authedFetch(`/posts/${id}`),
  ]);

  const errMsg = (
    <ErrorMessage>Sorry, we could not get the post data</ErrorMessage>
  );

  if (!postRes.ok || !commentsRes.ok) return errMsg;

  const post = (await postRes.json()) as Post;
  const comments = (await commentsRes.json()) as CommentType[];

  if (!post || !comments) return errMsg;

  const titleId = `title-${post.id}`;

  return (
    <div className='max-w-5xl mx-auto'>
      <header className='mt-6'>
        <div className='flex justify-between items-baseline border-b pb-2'>
          <H1 id={titleId} className='text-3xl'>
            {post.title}
          </H1>
          {userId === post.authorId && <PostOptionsMenu post={post} />}
        </div>
        <Muted className='flex items-baseline justify-between mt-1'>
          <FormattedDate
            createdAt={post.createdAt}
            updatedAt={post.updatedAt}
          />
          <PrivacyIcon isPublic={post.published} />
        </Muted>
      </header>
      <main>
        <article aria-labelledby={titleId}>
          <MutableImage image={post.image} className='my-6' />
          <Lead className='text-foreground font-light mb-6'>
            {post.content}
          </Lead>
          <Categories categories={post.categories} className='justify-end' />
          <section className='my-4'>
            <header>
              <H2 className='text-center text-xl'>Comments</H2>
            </header>
            <main>
              <BlogComments
                currentUserId={userId}
                comments={comments}
                post={post}
              />
            </main>
          </section>
        </article>
      </main>
    </div>
  );
}
