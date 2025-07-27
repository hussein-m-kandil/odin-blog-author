import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { post, mockAuthContext, mockDialogContext, delay } from '@/test-utils';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { CommentsSkeleton } from './comments.skeleton';
import { describe, expect, it, vi } from 'vitest';
import { Comments } from './comments';
import userEvent from '@testing-library/user-event';

const initialComments = post.comments.slice(0, 3);
const restComments = post.comments.slice(3);

const props = { post, initialComments };

mockDialogContext();

const fetchMock = vi.fn(
  () =>
    new Promise<Response>((resolve) =>
      delay(() => resolve(Response.json(restComments)))
    )
);
vi.spyOn(window, 'fetch').mockImplementation(fetchMock);

const { authData: oldAuthData, useAuthData, setAuthData } = mockAuthContext();
const authData = { ...oldAuthData, authFetch: window.fetch, user: post.author };
useAuthData.mockImplementation(() => ({ authData, setAuthData }));

const CommentsWrapper = (props: React.ComponentProps<typeof Comments>) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Comments {...props} />
    </QueryClientProvider>
  );
};

describe('<Comments />', () => {
  it('should have the given class', () => {
    const htmlClass = 'test-class';
    const { container } = render(
      <CommentsWrapper {...props} className={htmlClass} />
    );
    expect(container.firstElementChild).toHaveClass(htmlClass);
  });

  it('should not render new comment form if there is NOT a signed-in user', () => {
    useAuthData.mockImplementationOnce(() => ({
      authData: { ...authData, user: null },
      setAuthData,
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
    expect(commentList.children).toHaveLength(post.comments.length);
    for (const comment of restComments) {
      expect(screen.getByText(comment.content)).toBeInTheDocument();
    }
  });

  it('should display load-more error and retry button', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((reject) =>
          delay(() => reject(Response.json(null, { status: 404 })))
        )
    );
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
