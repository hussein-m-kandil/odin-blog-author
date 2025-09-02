'use client';

import React from 'react';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { CommentForm } from '@/components/comment-form';
import { useAuthData } from '@/contexts/auth-context';
import { QueryError } from '@/components/query-error';
import { Muted } from '@/components/typography/muted';
import { Comment as CommentT, Post } from '@/types';
import { Comment } from '@/components/comment';
import { Loader } from '@/components/loader';
import { Button } from '../ui/button';

export function Comments({
  initialComments,
  post,
  ...props
}: React.ComponentProps<'div'> & {
  initialComments: CommentT[];
  post: Post;
}) {
  const countRef = React.useRef(0);

  const {
    authData: { authAxios, user },
  } = useAuthData();

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
    queryKey: ['comments', post.id],
    initialData: { pages: [initialComments], pageParams: [0] },
    initialPageParam: initialComments[initialComments.length - 1]?.order || 0,
    queryFn: async ({ pageParam }) => {
      const url = `/posts/${post.id}/comments${
        pageParam ? '?cursor=' + pageParam.toString() : ''
      }`;
      return (await authAxios.get(url)).data;
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

  const isFetchDisabled = !hasNextPage || isFetching;

  const fetchNextIfYouCan = () => {
    if (hasNextPage && !isFetching) fetchNextPage();
  };

  const [extraComments, setExtraComments] = React.useState<CommentT[]>([]);

  React.useEffect(() => {
    if (extraComments.length) {
      const filteredExtraComments = [...extraComments];
      data.pages.forEach((p) =>
        p.forEach((c) => {
          const indexInExtras = filteredExtraComments.findIndex(
            ({ id }) => c.id === id
          );
          if (indexInExtras >= 0)
            filteredExtraComments.splice(indexInExtras, 1);
        })
      );
      if (filteredExtraComments.length < extraComments.length) {
        setExtraComments(filteredExtraComments);
      }
    }
  }, [data.pages, extraComments]);

  const addComment = (newComment: CommentT) => {
    setExtraComments([...extraComments, newComment]);
  };

  const updateExtraComment = (updatedComment: CommentT) => {
    let extraCommentUpdated = false;
    const updatedExtraComments = extraComments.map((ec) => {
      if (ec.id === updatedComment.id) {
        extraCommentUpdated = true;
        return updatedComment;
      }
      return ec;
    });
    if (extraCommentUpdated) {
      setExtraComments(updatedExtraComments);
    }
  };

  const deleteExtraComment = ({ id }: CommentT) => {
    const filteredExtraComments = extraComments.filter((ec) => ec.id !== id);
    if (filteredExtraComments.length < extraComments.length) {
      setExtraComments(filteredExtraComments);
    }
  };

  const CommentItems = ({ comments }: { comments: CommentT[] }) => {
    return comments.map((c) => (
      <li key={c.id}>
        <Comment
          onUpdate={updateExtraComment}
          onDelete={deleteExtraComment}
          comment={c}
          post={post}
          user={user}
        />
      </li>
    ));
  };

  const commentListRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    const oldCount = countRef.current;
    countRef.current = extraComments.length;
    countRef.current += data.pages.reduce((count, p) => count + p.length, 0);
    if (oldCount && oldCount < countRef.current) {
      commentListRef.current?.lastElementChild?.scrollIntoView?.();
    }
  }, [data.pages, extraComments]);

  const loader = <Loader aria-label='Loading comments' className='mx-auto' />;

  return (
    <div {...props}>
      {user && <CommentForm post={post} user={user} onSuccess={addComment} />}
      {isLoading ? (
        loader
      ) : isLoadingError || !Array.isArray(data?.pages[0]) ? (
        <QueryError onRefetch={refetch}>
          Sorry, we could not load the comments
        </QueryError>
      ) : !data.pages[0].length ? (
        <Muted className='text-center'>There are no comments</Muted>
      ) : (
        <div>
          <ul ref={commentListRef} aria-label='Comments' className='space-y-2'>
            {data.pages.map((comments, i) => (
              <CommentItems key={i} comments={comments} />
            ))}
            <CommentItems comments={extraComments} />
          </ul>
          <div className='my-4 text-center'>
            {isFetchingNextPage ? (
              loader
            ) : isFetchNextPageError ? (
              <QueryError onRefetch={fetchNextIfYouCan}>
                Sorry, we could not load more comments
              </QueryError>
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
