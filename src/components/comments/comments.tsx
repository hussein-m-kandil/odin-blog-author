'use client';

import React from 'react';
import { Comment as CommentT, Post } from '@/types';
import { CommentForm } from '@/components/comment-form';
import { Muted } from '@/components/typography/muted';
import { Comment } from '@/components/comment';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { useAuthData } from '@/contexts/auth-context';
import { ErrorMessage } from '../error-message';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

function QueryError({
  onRefetch,
  className,
  message,
  ...props
}: React.ComponentProps<'div'> & {
  onRefetch: () => void;
  message?: string;
}) {
  return (
    <div {...props} className={cn('text-center', className)}>
      <ErrorMessage>
        {message || 'Sorry, we could not load the data'}
      </ErrorMessage>
      <Button
        autoFocus
        size='sm'
        type='button'
        variant='outline'
        onClick={onRefetch}
        className='scroll-m-4'>
        Try again
      </Button>
    </div>
  );
}

export function Comments({
  initialComments,
  post,
  ...props
}: React.ComponentProps<'div'> & {
  initialComments: CommentT[];
  post: Post;
}) {
  const {
    authData: { backendUrl, authFetch, user },
  } = useAuthData();
  const currentUserId = user?.id;

  const {
    data,
    status,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery<
    CommentT[],
    Error,
    InfiniteData<CommentT[], number>,
    readonly unknown[],
    number
  >({
    queryKey: ['comments', post.id, backendUrl],
    initialData: { pages: [initialComments], pageParams: [0] },
    initialPageParam: initialComments[initialComments.length - 1]?.order || 0,
    queryFn: async ({ pageParam }) => {
      const url = new URL(`${backendUrl}/posts/${post.id}/comments`);
      if (pageParam !== 0) url.search = `?cursor=${pageParam}`;
      const res = await authFetch(url);
      if (!res.ok) throw res;
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length > 0) return lastPage[lastPage.length - 1]?.order;
    },
  });

  const fetchNextIfYouCan = () => hasNextPage && !isFetching && fetchNextPage();

  const isFetchDisabled = !hasNextPage || isFetching;

  const loader = <Loader className='animate-spin mx-auto' />;

  return (
    <div {...props}>
      {currentUserId && (
        <CommentForm postId={post.id} authorId={currentUserId} />
      )}
      {!Array.isArray(data.pages[0]) ||
      (status === 'error' && !isFetchNextPageError) ? (
        isFetching ? (
          loader
        ) : (
          <QueryError
            onRefetch={refetch}
            message='Sorry, we could not load the comments'
          />
        )
      ) : !data.pages[0].length ? (
        <Muted className='text-center'>There are no comments</Muted>
      ) : (
        <div>
          <ul aria-label='Comments' className='space-y-2'>
            {data.pages.map((comments, i) => (
              <React.Fragment key={i}>
                {comments.map((c) => (
                  <li key={c.id}>
                    <Comment
                      comment={c}
                      post={post}
                      currentUserId={currentUserId}
                    />
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
          <div className='my-4 text-center'>
            {isFetching
              ? loader
              : (isFetchNextPageError && (
                  <QueryError
                    onRefetch={fetchNextIfYouCan}
                    message='Sorry, we could not load more comments'
                  />
                )) ||
                (hasNextPage && (
                  <Button
                    type='button'
                    variant='link'
                    onClick={fetchNextIfYouCan}
                    disabled={isFetchDisabled}>
                    Load more comments
                  </Button>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Comments;
