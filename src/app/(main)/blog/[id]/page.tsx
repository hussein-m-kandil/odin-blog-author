import { ErrorMessage } from '@/components/error-message';
import { Muted } from '@/components/typography/muted';
import { Lead } from '@/components/typography/lead';
import { H2 } from '@/components/typography/h2';
import { authedFetch } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Post } from '@/types';

export default async function BlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const apiRes = await authedFetch(`/posts/${id}`);

  if (!apiRes.ok) {
    return <ErrorMessage>Sorry, we could not get the post data</ErrorMessage>;
  }

  const post: Post = await apiRes.json();

  return (
    <main className='max-w-2xl mx-auto mt-7'>
      <H2 className='text-center'>{post.title}</H2>
      <div className='flex items-center justify-between italic'>
        <Muted>{post.published ? 'Public' : 'Private'}</Muted>
        <Muted>Last updated at {formatDate(post.createdAt)}</Muted>
      </div>
      <Lead className='mt-7 text-foreground'>{post.content}</Lead>
    </main>
  );
}
