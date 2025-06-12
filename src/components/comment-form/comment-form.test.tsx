import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { CommentForm } from './comment-form';
import { author, post } from '@/test-utils';

const postId = post.id;
const authorId = author.id;
const comment = post.comments[0];

const onSuccess = vi.fn();

const createCommentProps = { postId, authorId, onSuccess };
const updateCommentProps = { comment, onSuccess };

const fetchMock = vi.fn<typeof fetch>(
  () =>
    new Promise<Response>((resolve) =>
      setTimeout(() => resolve(Response.json(post.comments[0])), 50)
    )
);

vi.spyOn(window, 'fetch').mockImplementation(fetchMock);

afterEach(vi.clearAllMocks);

describe('<CommentForm />', () => {
  it('should throw if not given neither `comment` prop, nor `postId` & `authorId` props', () => {
    const errRegex = /comment.*postId.*authorId/i;
    expect(() => render(<CommentForm />)).toThrowError(errRegex);
    expect(() => render(<CommentForm postId={postId} />)).toThrowError(
      errRegex
    );
    expect(() => render(<CommentForm authorId={authorId} />)).toThrowError(
      errRegex
    );
    expect(() => render(<CommentForm comment={comment} />)).not.toThrowError(
      errRegex
    );
    expect(() =>
      render(<CommentForm postId={postId} authorId={authorId} />)
    ).not.toThrowError(errRegex);
  });

  it('should render a new comment form', () => {
    render(<CommentForm {...createCommentProps} />);
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /comment/i })
    ).toBeInTheDocument();
    expect(
      (screen.getByRole('button', { name: /comment/i }) as HTMLButtonElement)
        .type
    ).toBe('submit');
  });

  it('should render an update comment form', () => {
    render(<CommentForm {...updateCommentProps} />);
    const submitter = screen.getByRole('button', {
      name: /comment/i,
    }) as HTMLButtonElement;
    const commentBox = screen.getByRole('textbox', { name: /comment/i });
    expect(commentBox).toHaveTextContent(comment.content);
    expect(submitter.type).toBe('submit');
  });

  it('should submit a new comment and call `onSuccess`', async () => {
    const user = userEvent.setup();
    const { authorId, postId, content } = comment;
    render(<CommentForm {...createCommentProps} />);
    await user.type(screen.getByRole('textbox', { name: /comment/i }), content);
    await user.click(screen.getByRole('button', { name: /comment/i }));
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      authorId,
      postId,
      content,
    });
    waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('should submit a comment update and call `onSuccess`', async () => {
    const user = userEvent.setup();
    const contentUpdate = 'test comment update';
    render(<CommentForm {...updateCommentProps} />);
    const commentBox = screen.getByRole('textbox', { name: /comment/i });
    await user.clear(commentBox);
    await user.type(commentBox, contentUpdate);
    await user.click(screen.getByRole('button', { name: /comment/i }));
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({
      content: contentUpdate,
    });
    waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});
