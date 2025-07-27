'use client';

import React from 'react';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { CommentForm } from '@/components/comment-form';
import { useAuthData } from '@/contexts/auth-context';
import { QueryError } from '@/components/query-error';
import { Muted } from '@/components/typography/muted';
import { Comment as CommentT, Post } from '@/types';
import { Comment } from '@/components/comment';
import { Button } from '../ui/button';
import { Loader } from 'lucide-react';

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
  const userId = user?.id;

  const {
    data,
    refetch,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isLoadingError,
    isFetchingNextPage,
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
      if (pageParam) url.searchParams.set('cursor', pageParam.toString());
      const res = await authFetch(url);
      if (!res.ok) throw res;
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length) {
        const commentsCount = allPages.reduce((c, { length }) => c + length, 0);
        if (commentsCount < post._count.comments) {
          return lastPage[lastPage.length - 1]?.order;
        }
      }
    },
  });

  const fetchNextIfYouCan = () => hasNextPage && !isFetching && fetchNextPage();

  const isFetchDisabled = !hasNextPage || isFetching;

  const loader = (
    <Loader aria-label='Loading comments' className='animate-spin mx-auto' />
  );

  return (
    <div {...props}>
      {userId && <CommentForm postId={post.id} authorId={userId} />}
      {isLoading ? (
        loader
      ) : isLoadingError || !Array.isArray(data?.pages[0]) ? (
        <QueryError
          onRefetch={refetch}
          message='Sorry, we could not load the comments'
        />
      ) : !data.pages[0].length ? (
        <Muted className='text-center'>There are no comments</Muted>
      ) : (
        <div>
          <ul aria-label='Comments' className='space-y-2'>
            {data.pages.map((comments, i) => (
              <React.Fragment key={i}>
                {comments.map((c) => (
                  <li key={c.id}>
                    <Comment comment={c} post={post} currentUserId={userId} />
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
          <div className='my-4 text-center'>
            {isFetchingNextPage ? (
              loader
            ) : isFetchNextPageError ? (
              <QueryError
                onRefetch={fetchNextIfYouCan}
                message='Sorry, we could not load more comments'
              />
            ) : (
              hasNextPage && (
                <Button
                  type='button'
                  variant='link'
                  onClick={fetchNextIfYouCan}
                  disabled={isFetchDisabled}>
                  Load more comments
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Comments;
