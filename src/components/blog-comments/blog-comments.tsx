'use client';

import React, { useEffect } from 'react';
import { Comment as CommentType, Post, ID } from '@/types';
import { CommentForm } from '@/components/comment-form';
import { Muted } from '@/components/typography/muted';
import { Comment } from '@/components/comment';

export function BlogComments({
  currentUserId,
  comments,
  post,
  ...containerProps
}: React.ComponentProps<'div'> & {
  currentUserId?: ID | null;
  comments: CommentType[];
  post: Post;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastIdRef = React.useRef(comments.at(-1)?.id);

  const scrollToContainerBottom = () => {
    if (containerRef.current) {
      const { offsetHeight, offsetTop } = containerRef.current;
      window.scroll(0, offsetHeight + offsetTop);
    }
  };

  useEffect(() => {
    const currentLastId = comments.at(-1)?.id;
    if (lastIdRef.current !== currentLastId) {
      lastIdRef.current = currentLastId;
      scrollToContainerBottom();
    }
  }, [comments]);

  return (
    <div {...containerProps} ref={containerRef}>
      {currentUserId && (
        <CommentForm postId={post.id} authorId={currentUserId} />
      )}
      {comments.length < 1 ? (
        <Muted className='text-center'>There are no comments</Muted>
      ) : (
        <ul aria-label='Comments' className='space-y-1'>
          {comments.map((c) => (
            <li key={c.id}>
              <Comment comment={c} post={post} currentUserId={currentUserId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BlogComments;
