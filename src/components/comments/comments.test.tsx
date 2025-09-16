import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { post, initAuthData, mockDialogContext } from '@/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { CommentsSkeleton } from './comments.skeleton';
import { AuthProvider } from '@/contexts/auth-context';
import { axiosMock } from '@/../__mocks__/axios';
import { Comments } from './comments';

mockDialogContext();

const comments = post.comments.reverse();
const initialComments = comments.slice(0, 3);
const restComments = comments.slice(3);

const props = { post, initialComments };

const getInitAuthData = vi.fn(() => initAuthData);

const CommentsWrapper = (props: React.ComponentProps<typeof Comments>) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, staleTime: Infinity } },
        })
      }>
      <AuthProvider initAuthData={getInitAuthData()}>
        <Comments {...props} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('<Comments />', () => {
  beforeEach(() => axiosMock.onGet().reply(200, restComments));

  it('should have the given class', () => {
    const htmlClass = 'test-class';
    const { container } = render(
      <CommentsWrapper {...props} className={htmlClass} />
    );
    expect(container.firstElementChild).toHaveClass(htmlClass);
  });

  it('should not render new comment form if there is NOT a signed-in user', () => {
    getInitAuthData.mockImplementationOnce(() => ({
      ...initAuthData,
      user: null,
    }));
    render(<CommentsWrapper post={post} initialComments={initialComments} />);
    expect(screen.queryByRole('form', { name: /comment/i })).toBeNull();
  });

  it('should render new comment form if there is a signed-in user', () => {
    render(<CommentsWrapper {...props} />);
    expect(screen.getByRole('form', { name: /comment/i })).toBeInTheDocument();
  });

  it('should display no comments message', () => {
    render(<CommentsWrapper {...{ ...props, initialComments: [] }} />);
    expect(screen.getByText(/no comments/i)).toBeInTheDocument();
  });

  it('should render the given list of comments', () => {
    render(<CommentsWrapper {...props} />);
    const commentList = screen.getByRole('list', { name: /comments/i });
    expect(commentList).toBeInTheDocument();
    expect(commentList.children).toHaveLength(initialComments.length);
    for (const comment of initialComments) {
      expect(screen.getByText(comment.content)).toBeInTheDocument();
    }
  });

  it('should render more comments after clicking load-more button', async () => {
    const user = userEvent.setup();
    render(<CommentsWrapper {...props} />);
    await user.click(screen.getByRole('button', { name: /more/i }));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    const commentList = screen.getByRole('list', { name: /comments/i });
    expect(commentList).toBeInTheDocument();
    expect(commentList.children).toHaveLength(comments.length);
    for (const comment of restComments) {
      expect(screen.getByText(comment.content)).toBeInTheDocument();
    }
  });

  it('should display load error and retry button', async () => {
    axiosMock.onGet().networkError();
    const user = userEvent.setup();
    render(<CommentsWrapper {...props} />);
    await user.click(screen.getByRole('button', { name: /more/i }));
    await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i));
    expect(screen.getByText(/.could(n't| not)/i)).toBeInTheDocument();
  });
});

describe('<CommentsSkeleton />', () => {
  it('should have the given className', () => {
    const className = 'test-class';
    render(<CommentsSkeleton className={className} />);
    expect(screen.getByLabelText(/loading .* post comments/i)).toHaveClass(
      className
    );
  });
});
