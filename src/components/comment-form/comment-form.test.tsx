import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { author, initAuthData, post } from '@/test-utils';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/auth-context';
import { axiosMock } from '@/__mocks__/axios';
import { CommentForm } from './comment-form';

describe('<CommentForm />', () => {
  const postId = post.id;
  const authorId = author.id;
  const comment = post.comments[0];

  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  const createCommentProps = { postId, authorId, onSuccess };
  const updateCommentProps = { comment, onSuccess, onCancel };

  beforeEach(() => {
    axiosMock.onPost().reply(201, comment);
    axiosMock.onPut().reply(200, comment);
  });

  afterEach(vi.clearAllMocks);

  const CommentFormWrapper = (
    props: React.ComponentProps<typeof CommentForm>
  ) => {
    return (
      <AuthProvider initAuthData={initAuthData}>
        <CommentForm {...props} />
      </AuthProvider>
    );
  };

  it('should throw if not given neither `comment` & `onCancel` prop, nor `postId` & `authorId` props', () => {
    const errRegex = /comment.*postId.*authorId/i;
    expect(() => render(<CommentFormWrapper />)).toThrowError(errRegex);
    expect(() => render(<CommentFormWrapper postId={postId} />)).toThrowError(
      errRegex
    );
    expect(() =>
      render(<CommentFormWrapper authorId={authorId} />)
    ).toThrowError(errRegex);
    expect(() => render(<CommentFormWrapper comment={comment} />)).toThrowError(
      /onCancel/i
    );
    expect(() =>
      render(<CommentFormWrapper comment={comment} onCancel={onCancel} />)
    ).not.toThrowError();
    expect(() =>
      render(<CommentFormWrapper postId={postId} authorId={authorId} />)
    ).not.toThrowError();
  });

  it('should render a new comment form', () => {
    render(<CommentFormWrapper {...createCommentProps} />);
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /comment/i })
    ).toBeInTheDocument();
    expect(
      (screen.getByRole('button', { name: /comment/i }) as HTMLButtonElement)
        .type
    ).toBe('submit');
    expect(screen.getByRole('textbox', { name: /comment/i })).not.toHaveFocus();
  });

  it('should render an update comment form', () => {
    render(<CommentFormWrapper {...updateCommentProps} />);
    const submitter = screen.getByRole('button', {
      name: /update/i,
    }) as HTMLButtonElement;
    const commentBox = screen.getByRole('textbox', { name: /comment/i });
    expect(commentBox).toHaveFocus();
    expect(submitter.type).toBe('submit');
    expect(commentBox).toHaveTextContent(comment.content);
  });

  it('should submit a new comment and call `onSuccess`', async () => {
    axiosMock.resetHistory();
    const user = userEvent.setup();
    const { authorId, postId, content } = comment;
    render(<CommentFormWrapper {...createCommentProps} />);
    await user.type(screen.getByRole('textbox', { name: /comment/i }), content);
    await user.click(screen.getByRole('button', { name: /comment/i }));
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /commenting/i })
    );
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      authorId,
      postId,
      content,
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('should Cancel a comment update and call `onCancel` when cancel-button clicked', async () => {
    axiosMock.resetHistory();
    const user = userEvent.setup();
    const updatedContent = 'test comment update';
    render(<CommentFormWrapper {...updateCommentProps} />);
    const commentBox = screen.getByRole('textbox', { name: /comment/i });
    await user.clear(commentBox);
    await user.type(commentBox, updatedContent);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(onCancel).toHaveBeenCalledOnce());
    expect(screen.getByText(comment.content)).toBeInTheDocument();
    expect(screen.queryByText(updatedContent)).toBeNull();
    expect(axiosMock.history).toHaveLength(0);
  });

  it('should Cancel a comment update and call `onCancel` when `Esc` key pressed', async () => {
    axiosMock.resetHistory();
    const user = userEvent.setup();
    const updatedContent = 'test comment update';
    render(<CommentFormWrapper {...updateCommentProps} />);
    const commentBox = screen.getByRole('textbox', { name: /comment/i });
    await user.clear(commentBox);
    await user.type(commentBox, updatedContent);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onCancel).toHaveBeenCalledOnce());
    expect(screen.getByText(comment.content)).toBeInTheDocument();
    expect(screen.queryByText(updatedContent)).toBeNull();
    expect(axiosMock.history).toHaveLength(0);
  });

  it('should submit a comment update and call `onSuccess`', async () => {
    axiosMock.resetHistory();
    const user = userEvent.setup();
    const updatedContent = 'test comment update';
    render(<CommentFormWrapper {...updateCommentProps} />);
    const commentBox = screen.getByRole('textbox', { name: /comment/i });
    await user.clear(commentBox);
    await user.type(commentBox, updatedContent);
    await user.click(screen.getByRole('button', { name: /update/i }));
    expect(axiosMock.history.put).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      content: updatedContent,
    });
    await waitForElementToBeRemoved(() =>
      screen.getByRole('button', { name: /updating/i })
    );
    expect(screen.queryByDisplayValue(comment.content)).toBeNull();
    expect(screen.queryByText(comment.content)).toBeNull();
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
