import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { delay, mockDialogContext, post } from '@/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Posts } from './posts';

mockDialogContext();

const postsUrl = 'https://example.com/';

const PostsWrapper = (
  props: Omit<React.ComponentProps<typeof Posts>, 'postsUrl'>
) => {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }>
      <Posts postsUrl={postsUrl} {...props} />
    </QueryClientProvider>
  );
};

const posts = [post, { ...post, id: 'test-post-2', title: 'Test Post #2' }];

const fetchMock = vi.fn(
  () =>
    new Promise<Response>((resolve) =>
      delay(() => resolve(Response.json(posts)))
    )
);

vi.spyOn(window, 'fetch').mockImplementation(fetchMock);

afterEach(vi.clearAllMocks);

describe('<Blogs />', () => {
  it('should have the given class', async () => {
    const className = 'test-class';
    const { container } = render(<PostsWrapper className={className} />);
    await waitFor(() => screen.getAllByRole('link', { name: /read/i }));
    expect(container.getElementsByClassName(className)).toHaveLength(1);
  });

  it('should call fetch with given url', () => {
    render(<PostsWrapper />);
    expect((fetchMock.mock.calls[0] as unknown[])[0]).toStrictEqual(postsUrl);
  });

  it('should display all the given posts', async () => {
    render(<PostsWrapper />);
    await waitFor(() => screen.getAllByRole('link', { name: /read/i }));
    expect(
      screen.getAllByRole('link', { name: /read/i }).length
    ).toBeGreaterThanOrEqual(posts.length);
    expect(
      screen.getAllByText(new RegExp(post.author.username, 'i'))
    ).toHaveLength(posts.length);
    for (const post of posts) {
      expect(screen.getByText(post.title)).toBeInTheDocument();
    }
  });

  it('should display a message informs the user that there are no posts', async () => {
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) =>
          delay(() => resolve(Response.json([])))
        )
    );
    render(<PostsWrapper />);
    await waitFor(() =>
      expect(screen.getByText(/no posts/i)).toBeInTheDocument()
    );
  });

  it('should show error message on error', async () => {
    fetchMock.mockImplementationOnce(() => {
      throw Error('test error');
    });
    render(<PostsWrapper />);
    await waitFor(() =>
      expect(
        screen.getByText(/could(n't| not) get.* posts/i)
      ).toBeInTheDocument()
    );
  });

  it('should show error message on reject', async () => {
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((_, reject) => {
          reject(Response.json(null, { status: 400 }));
        })
    );
    render(<PostsWrapper />);
    await waitFor(() =>
      expect(
        screen.getByText(/could(n't| not) get.* posts/i)
      ).toBeInTheDocument()
    );
  });
});
