import { PostFormDialog } from '@/components/post-form-dialog';
import { ErrorMessage } from '@/components/error-message';
import { Muted } from '@/components/typography/muted';
import { Separator } from '@/components/ui/separator';
import { Categories } from '@/components/categories';
import { authedFetch, getUserId } from '@/lib/auth';
import { Lead } from '@/components/typography/lead';
import { H2 } from '@/components/typography/h2';
import { formatDate } from '@/lib/utils';
import { Post } from '@/types';

export default async function BlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const userId = await getUserId();

  const apiRes = await authedFetch(`/posts/${id}`);

  const errMsg = (
    <ErrorMessage>Sorry, we could not get the post data</ErrorMessage>
  );

  if (!apiRes.ok) return errMsg;

  const post = (await apiRes.json()) as Post;

  if (!post) return errMsg;

  const commonTriggerProps = {
    className: 'w-auto align-middle cursor-pointer',
    post,
  };

  return (
    <main className='max-w-2xl px-3 mx-auto'>
      {userId === post.authorId && (
        <div className='flex justify-center space-x-4 h-6 mt-4'>
          <PostFormDialog {...commonTriggerProps} />
          <Separator orientation='vertical' />
          <PostFormDialog {...commonTriggerProps} showDeleteForm={true} />
        </div>
      )}
      <div className='mt-2 space-y-12'>
        <div>
          <H2 className='text-center text-2xl'>{post.title}</H2>
          <div className='flex items-center justify-between italic'>
            <Muted>{post.published ? 'Public' : 'Private'}</Muted>
            <Muted>Last updated at {formatDate(post.createdAt)}</Muted>
          </div>
        </div>
        <Lead className='text-foreground font-light'>{post.content}</Lead>
        <Categories categories={post.categories} className='justify-end' />
      </div>
    </main>
  );
}
